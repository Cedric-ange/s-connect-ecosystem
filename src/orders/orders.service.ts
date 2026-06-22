import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🏢 FACTORY ENGINE : Onboarding automatique d'une entreprise (Tenant), de son logo et de son premier manager racine
   */
  async provisionNewTenant(tenantData: { companyName: string; industry: string; logoUrl?: string }, adminData: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Création automatique de la structure de l'entreprise
      const tenant = await tx.tenant.create({
        data: {
          companyName: tenantData.companyName,
          industry: tenantData.industry,
          logoUrl: tenantData.logoUrl || null,
          isActive: true
        }
      });

      // 2. Génération automatique du matricule unique pour le Manager
      const managerMatricule = `MGR-${tenant.companyName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Création automatique du premier Manager (Root Admin) lié au Tenant
      const rootManager = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: adminData.email,
          password: adminData.password, 
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: 'ADMIN', 
          phone: adminData.phone,
          matricule: managerMatricule,
          photoUrl: tenantData.logoUrl || null, 
          status: 'ACTIVE',
          isActive: true
        }
      });

      return {
        success: true,
        message: `Organisation [${tenant.companyName}] provisionnée avec succès.`,
        tenantId: tenant.id,
        rootManager: {
          id: rootManager.id,
          email: rootManager.email,
          matricule: rootManager.matricule
        }
      };
    });
  }

  /**
   * 🍦 FLUX COMMERCIAL UNIQUE : Gère le Van-Selling (Direct) et le Pre-Selling (Merchandiser / À livrer)
   */
  async createOrderFromVan(creatorId: string, tenantId: string, data: any) {
    const { outletId, visitId, notes, paymentMethod, items, deliveryType } = data;
    const currentDeliveryType = deliveryType || 'DIRECT_VAN'; 
    const orderNumber = `CMD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const outlet = await this.prisma.outlet.findFirst({
      where: { id: outletId, tenantId },
      include: { territory: true }
    });
    if (!outlet) throw new NotFoundException("Point de vente introuvable dans cette organisation.");

    const assignedRep = await this.prisma.user.findFirst({
      where: {
        tenantId,
        role: 'REP',
        territoryId: outlet.territoryId,
        isActive: true
      }
    });

    const finalVendeurId = assignedRep ? assignedRep.id : creatorId;

    return this.prisma.$transaction(async (tx) => {
      let totalHt = 0;
      const orderLinesData: any[] = []; 
      const stockUpdates: any[] = [];    

      for (const item of items) {
        const sku = await tx.sKU.findFirst({ where: { id: item.skuId, tenantId } });
        if (!sku) throw new NotFoundException(`Produit introuvable : ${item.skuId}`);

        if (currentDeliveryType === 'DIRECT_VAN') {
          const vendorStock = await tx.vendorStock.findUnique({
            where: { userId_skuId: { userId: finalVendeurId, skuId: item.skuId } }
          });

          if (!vendorStock || vendorStock.quantity < item.quantity) {
            throw new BadRequestException(
              `Stock insuffisant dans le van pour [${sku.name}]. Demandé: ${item.quantity}, Dispo: ${vendorStock?.quantity || 0}`
            );
          }

          stockUpdates.push({
            vendorStockId: vendorStock.id,
            beforeQty: vendorStock.quantity,
            afterQty: vendorStock.quantity - item.quantity,
            quantity: item.quantity,
            skuId: item.skuId
          });
        }

        const lineHt = sku.priceHt * item.quantity;
        totalHt += lineHt;

        orderLinesData.push({
          skuId: item.skuId,
          quantity: item.quantity,
          unitPriceHt: sku.priceHt,
          totalPriceHt: lineHt,
          totalPriceTtc: lineHt * (1 + sku.vatRate / 100),
        });
      }

      const totalTtc = orderLinesData.reduce((sum, line) => sum + line.totalPriceTtc, 0);

      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          outletId,
          userId: finalVendeurId, 
          visitId,
          status: currentDeliveryType === 'DIRECT_VAN' ? 'COMPLETED' : 'PENDING',
          paymentStatus: currentDeliveryType === 'DIRECT_VAN' ? 'PAID' : 'PENDING',
          paymentMethod: paymentMethod || 'CASH',
          totalHt,
          totalTtc,
          notes: currentDeliveryType !== 'DIRECT_VAN' 
            ? `[PRE-ORDER] Prise par ID: ${creatorId}. À livrer par le vendeur attitré. ` + (notes || '')
            : notes,
          items: { create: orderLinesData }
        }
      });

      if (currentDeliveryType === 'DIRECT_VAN') {
        for (const update of stockUpdates) {
          await tx.vendorStock.update({
            where: { id: update.vendorStockId },
            data: { quantity: update.afterQty }
          });

          await tx.stockHistory.create({
            data: {
              stockItemId: update.vendorStockId,
              movementType: 'VAN_SALE',
              quantity: update.quantity,
              beforeQty: update.beforeQty,
              afterQty: update.afterQty,
              orderId: order.id,
              notes: `Vente Directe au PDV: ${outletId}`
            }
          });
        }
      }

      if (currentDeliveryType === 'DIRECT_VAN' && visitId) {
        await tx.visit.update({
          where: { id: visitId },
          data: { status: 'COMPLETED' }
        });
      }

      return {
        ...order,
        assignedToRepId: finalVendeurId,
        mode: currentDeliveryType
      };
    });
  }

  /**
   * 📑 GENERATOR : Prépare toutes les métadonnées pour l'impression du reçu PDF
   */
  async generateOrderReceipt(orderId: string, userId: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        outlet: true,
        user: true,
        tenant: true,
        items: { include: { sku: true } }
      }
    });

    if (!order) throw new NotFoundException("Commande introuvable.");

    const itemsFormatted = order.items.map(item => ({
      code: item.sku.code,
      designation: item.sku.displayName || item.sku.name,
      quantite: item.quantity,
      prixUnitaireHt: item.unitPriceHt + " XOF",
      totalHt: item.totalPriceHt + " XOF",
      tva: item.sku.vatRate + "%",
      totalTtc: Math.round(item.totalPriceTtc) + " XOF"
    }));

    return {
      documentType: order.status === 'COMPLETED' ? 'FACTURE_DE_VENTE_DIRECTE' : 'BON_DE_COMMANDE_PRE_ORDER',
      companyHeader: {
        name: order.tenant.companyName,
        industry: order.tenant.industry,
        dateDocument: order.orderDate
      },
      referenceIdentification: {
        orderNumber: order.orderNumber,
        statutCommande: order.status,
        modePaiement: order.paymentMethod,
        statutPaiement: order.paymentStatus
      },
      clientDetails: {
        codePDV: order.outlet.code,
        nomPDV: order.outlet.name,
        adresse: order.outlet.address
      },
      agentDetails: {
        matricule: order.user.matricule,
        nomAgent: `${order.user.firstName} ${order.user.lastName}`,
        telephone: order.user.phone
      },
      lignesFacture: itemsFormatted,
      syntheseFinanciere: {
        totalMontantHt: order.totalHt + " XOF",
        tvaAppliquee: order.vatRate + "%",
        totalMontantTtc: order.totalTtc + " XOF"
      },
      legalNotice: "Document généré électroniquement par Salesconnected. Fan Milk International - RTM Engine v2."
    };
  }

  /**
   * 🚚 DOUBLE SIGNATURE LOGISTIQUE : Validation définitive du transfert de stock KD ➔ Camion
   */
  async acknowledgeAndSignStock(vendeurId: string, tenantId: string, approvalDto: any) {
    const { items, adminSignatureUrl, vendeurSignatureDataUrl } = approvalDto;

    if (!vendeurSignatureDataUrl || !adminSignatureUrl) {
      throw new BadRequestException("La signature du gestionnaire de dépôt et celle du vendeur sont obligatoires.");
    }

    return this.prisma.$transaction(async (tx) => {
      const loadResults: any[] = [];
      const bonSortieStockNumber = `BON-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      for (const item of items) {
        const vendorStock = await tx.vendorStock.upsert({
          where: { userId_skuId: { userId: vendeurId, skuId: item.skuId } },
          update: { quantity: { increment: item.quantity } },
          create: {
            tenantId: tenantId, 
            userId: vendeurId,
            skuId: item.skuId,
            quantity: item.quantity,
            alertThreshold: 10
          }
        });

        await tx.stockHistory.create({
          data: {
            stockItemId: vendorStock.id,
            movementType: 'VAN_LOADING',
            quantity: item.quantity,
            beforeQty: vendorStock.quantity - item.quantity,
            afterQty: vendorStock.quantity,
            notes: `[${bonSortieStockNumber}] Chargement validé par signatures conjointes.`
          }
        });

        loadResults.push({
          skuId: item.skuId,
          nouvelleQuantiteVan: vendorStock.quantity
        });
      }

      return {
        success: true,
        bonSortieNumero: bonSortieStockNumber,
        message: "Accusé de réception enregistré. Responsabilité légale du stock transférée au vendeur.",
        signaturesPreuves: {
          signatureResponsableDepot: adminSignatureUrl,
          signatureVendeurEngin: vendeurSignatureDataUrl,
          signeLe: new Date()
        },
        inventaireMisAjour: loadResults
      };
    });
  }

  /**
   * 📊 METRIC ENGINE & INVENTAIRE VALORISÉ
   */
  async calculateRtmKpis(userId: string, tenantId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const [visites, commandes] = await Promise.all([
      this.prisma.visit.findMany({ where: { userId, tenantId, createdAt: { gte: startOfDay } } }),
      this.prisma.order.findMany({ 
        where: { userId, tenantId, orderDate: { gte: startOfDay } },
        include: { items: true }
      })
    ]);

    const totalVisits = visites.length;
    const successfulVisits = commandes.filter(c => c.visitId !== null).length;
    const totalCa = commandes.reduce((sum, c) => sum + c.totalTtc, 0);

    const strikeRate = totalVisits > 0 ? (successfulVisits / totalVisits) * 100 : 0;
    const dropSize = successfulVisits > 0 ? totalCa / successfulVisits : 0;
    const totalLines = commandes.reduce((sum, c) => sum + c.items.length, 0);
    const lpc = commandes.length > 0 ? totalLines / commandes.length : 0;

    const stockItems: any[] = await this.prisma.vendorStock.findMany({
      where: { userId, tenantId },
      include: { sku: true }
    });

    let valeurStockHt = 0;
    const detailsStock = stockItems.map(item => {
      const valeurLigne = item.quantity * (item.sku?.priceHt || 0);
      valeurStockHt += valeurLigne;
      return {
        sku: item.sku?.name || 'Inconnu',
        quantite: item.quantity,
        valeurHt: valeurLigne + " XOF"
      };
    });

    return {
      date: today.toISOString().split('T')[0],
      kpis: {
        chiffreAffaireTotal: Math.round(totalCa) + " XOF",
        totalVisites: totalVisits,
        visitesVentesReussies: successfulVisits,
        strikeRate: parseFloat(strikeRate.toFixed(2)) + "%",
        dropSize: Math.round(dropSize) + " XOF",
        linesPerOrder: parseFloat(lpc.toFixed(2))
      },
      liveInventory: {
        valeurTotaleDuVanHt: valeurStockHt + " XOF",
        references: detailsStock
      }
    };
  }

  async loadVendorVan(userId: string, tenantId: string, items: Array<{ skuId: string; quantity: number }>) {
    return this.prisma.$transaction(async (tx) => {
      const loadResults: any[] = [];

      for (const item of items) {
        const vendorStock = await tx.vendorStock.upsert({
          where: { userId_skuId: { userId, skuId: item.skuId } },
          update: { quantity: { increment: item.quantity } },
          create: {
            tenantId: tenantId, 
            userId,
            skuId: item.skuId,
            quantity: item.quantity,
            alertThreshold: 10
          }
        });

        await tx.stockHistory.create({
          data: {
            stockItemId: vendorStock.id,
            movementType: 'VAN_LOADING',
            quantity: item.quantity,
            beforeQty: vendorStock.quantity - item.quantity,
            afterQty: vendorStock.quantity,
            notes: "Chargement déduit du stock KD et réceptionné dans l'engin mobile"
          }
        });

        loadResults.push(vendorStock);
      }

      return { success: true, message: "Camion chargé et inventaire mis à jour avec succès", stock: loadResults };
    });
  }

  /**
   * 🎯 RTM GLOBAL TARGET ENGINE : Gestion des objectifs multiniveaux de la force de vente classique (HORS WORKFLOW)
   */
  async upsertRtmTarget(tenantId: string, data: { userId: string; month: number; year: number; targetCa: number; targetVisits: number }) {
    return this.prisma.rtmTarget.upsert({
      where: { userId_month_year: { userId: data.userId, month: data.month, year: data.year } },
      update: { targetCa: data.targetCa, targetVisits: data.targetVisits },
      create: { tenantId, ...data }
    });
  }

  async getRtmPerformanceConsolidated(tenantId: string, month: number, year: number, filterType: 'GLOBAL' | 'SUPERVISOR' | 'TERRITORY', referenceId?: string) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // 1. Récupérer toutes les ventes et objectifs du mois
    const allTargets = await this.prisma.rtmTarget.findMany({
      where: { tenantId, month, year },
      include: { user: true }
    });

    const allOrders = await this.prisma.order.findMany({
      where: { tenantId, orderDate: { gte: startOfMonth, lte: endOfMonth }, status: 'COMPLETED' },
      include: { outlet: true, user: true }
    });

    let filteredTargets = allTargets;
    let filteredOrders = allOrders;

    // 2. Application de la logique d'arbre hiérarchique
    if (filterType === 'SUPERVISOR' && referenceId) {
      filteredTargets = allTargets.filter(t => t.user.managerId === referenceId);
      filteredOrders = allOrders.filter(o => o.user.managerId === referenceId);
    } else if (filterType === 'TERRITORY' && referenceId) {
      filteredTargets = allTargets.filter(t => t.user.territoryId === referenceId);
      filteredOrders = allOrders.filter(o => o.outlet.territoryId === referenceId);
    }

    const totalTargetCa = filteredTargets.reduce((sum, t) => sum + t.targetCa, 0);
    const totalActualCa = filteredOrders.reduce((sum, o) => sum + o.totalTtc, 0);
    const performanceRate = totalTargetCa > 0 ? (totalActualCa / totalTargetCa) * 100 : 0;

    return {
      scope: filterType,
      referenceId: referenceId || 'ALL',
      period: `${month}/${year}`,
      summary: {
        totalObjectivesCa: totalTargetCa + " XOF",
        totalAchievedCa: totalActualCa + " XOF",
        varianceCa: (totalActualCa - totalTargetCa) + " XOF",
        performanceRate: parseFloat(performanceRate.toFixed(2)) + "%"
      }
    };
  }

  /**
   * 📝 NO-CODE SCHEMA BUILDER : Création de formulaires isolés ou LIÉS (Clés Étrangères)
   */
  async createNoCodeForm(tenantId: string, data: any) {
    const { title, purpose, isWorkflow, fields } = data;

    return this.prisma.dynamicForm.create({
      data: {
        tenantId,
        title,
        purpose: purpose || 'GENERIC_SURVEY',
        isWorkflow: isWorkflow ?? true,
        fields: {
          create: fields.map((f: any) => ({
            label: f.label,
            type: f.type,
            isRequired: f.isRequired ?? false,
            order: f.order ?? 0,
            isForeignKey: f.isForeignKey ?? false,
            referencesFormId: f.referencesFormId || null
          })),
        },
      },
      include: { fields: true },
    });
  }

  async getNoCodeForms(tenantId: string) {
    return this.prisma.dynamicForm.findMany({
      where: { tenantId },
      include: { fields: true },
    });
  }

  async getForeignKeyOptions(formId: string) {
    const parentSubmissions = await this.prisma.submission.findMany({
      where: { formId },
      select: { id: true, payload: true }
    });

    return parentSubmissions.map(sub => {
      const payloadData = sub.payload as any;
      const firstKey = Object.keys(payloadData)[0];
      return {
        primaryKey: sub.id,
        displayName: payloadData[firstKey] || `Ligne #${sub.id.slice(0,5)}`
      };
    });
  }

  async setWorkflowTargets(formId: string, targets: { userId: string; targetValue: number }[]) {
    const operations = targets.map(t => 
      this.prisma.workflowTarget.upsert({
        where: { formId_userId: { formId, userId: t.userId } },
        update: { targetValue: t.targetValue },
        create: { formId, userId: t.userId, targetValue: t.targetValue }
      })
    );
    await Promise.all(operations);
    return { success: true, message: "Objectifs de la campagne commando enregistrés." };
  }

  async submitNoCodeAudit(data: { formId: string; outletId?: string; payload: any; userId: string }) {
    const { formId, outletId, payload, userId } = data;

    const submission = await this.prisma.submission.create({
      data: {
        formId,
        userId,
        outletId: outletId || null,
        payload, 
        importedVia: 'MOBILE'
      },
    });

    return {
      success: true,
      message: "Relevé d'audit terrain enregistré avec succès.",
      submissionId: submission.id,
    };
  }

  async generateExcelTemplateStructure(formId: string, tenantId: string) {
    const form = await this.prisma.dynamicForm.findFirst({
      where: { id: formId, tenantId },
      include: { fields: true }
    });
    if (!form) throw new NotFoundException("Workflow ou Formulaire introuvable.");

    const columns = form.fields.sort((a,b) => a.order - b.order).map(f => ({
      header: f.label,
      key: f.label,
      type: f.type,
      required: f.isRequired
    }));

    return {
      workflowId: form.id,
      workflowTitle: form.title,
      templateStructure: columns,
      instructions: "Ne modifiez pas les en-têtes de colonnes. Respectez scrupuleusement les types définis."
    };
  }

  async importExcelToWorkflow(formId: string, creatorId: string, rows: any[]) {
    const form = await this.prisma.dynamicForm.findUnique({
      where: { id: formId },
      include: { fields: true }
    });
    if (!form) throw new NotFoundException("Workflow introuvable.");

    const validatedSubmissions: any[] = [];

    for (const [index, row] of rows.entries()) {
      const rowPayload: any = {};

      for (const field of form.fields) {
        const userValue = row[field.label];

        if (field.isRequired && (userValue === undefined || userValue === null || userValue === '')) {
          throw new BadRequestException(`Erreur d'importation Ligne ${index + 1} : Le champ [${field.label}] est obligatoire.`);
        }

        if (userValue !== undefined && userValue !== null && userValue !== '') {
          if (field.type === 'NUMBER' && isNaN(Number(userValue))) {
            throw new BadRequestException(`Erreur de type Ligne ${index + 1} : [${field.label}] doit être un nombre.`);
          }
          if (field.type === 'BOOLEAN' && typeof userValue !== 'boolean' && userValue !== 'true' && userValue !== 'false') {
            throw new BadRequestException(`Erreur de type Ligne ${index + 1} : [${field.label}] doit être Vrai ou Faux.`);
          }
        }

        rowPayload[field.label] = userValue;
      }

      validatedSubmissions.push({
        formId,
        userId: creatorId, 
        payload: rowPayload,
        importedVia: 'EXCEL_IMPORT'
      });
    }

    await this.prisma.submission.createMany({
      data: validatedSubmissions
    });

    return {
      success: true,
      message: `Importation réussie avec succès. ${validatedSubmissions.length} lignes tabulaires intégrées aux trackers.`
    };
  }

  async getWorkflowPerformance(formId: string) {
    const targets = await this.prisma.workflowTarget.findMany({
      where: { formId },
      include: { user: true }
    });

    const submissions = await this.prisma.submission.findMany({
      where: { formId }
    });

    const report = targets.map(t => {
      const agentSubmissions = submissions.filter(s => s.userId === t.userId);
      let realisat = 0;
      
      agentSubmissions.forEach(sub => {
        const data = sub.payload as any;
        const numericKey = Object.keys(data).find(k => !isNaN(Number(data[k])));
        if (numericKey) realisat += Number(data[numericKey]);
      });

      const completionRate = t.targetValue > 0 ? (realisat / t.targetValue) * 100 : 0;

      return {
        agent: `${t.user.firstName} ${t.user.lastName}`,
        matricule: t.user.matricule,
        objectifFixe: t.targetValue,
        realise: realisat,
        tauxAtteinte: parseFloat(completionRate.toFixed(2)) + "%"
      };
    });

    return {
      workflowId: formId,
      resultatsAnalyseTrackers: report
    };
  }

  async getCrossFormAnalytics(targetFormId: string, actualFormId: string, targetFieldName: string, actualFieldName: string) {
    const targetFormDef = await this.prisma.dynamicForm.findUnique({
      where: { id: targetFormId },
      include: { fields: true }
    });

    const labelField = targetFormDef?.fields
      .filter(f => f.type === 'TEXT')
      .sort((a, b) => a.order - b.order)[0];

    const labelKey = labelField ? labelField.label : null;

    const targets = await this.prisma.submission.findMany({ where: { formId: targetFormId } });
    const actuals = await this.prisma.submission.findMany({ where: { formId: actualFormId } });

    const analysis = targets.map(t => {
      const targetPayload = t.payload as any;
      const targetValue = Number(targetPayload[targetFieldName]) || 0;
      const targetReference = labelKey ? targetPayload[labelKey] : (targetPayload[Object.keys(targetPayload)[0]] || t.id);

      const linkedActuals = actuals.filter(a => {
        const actualPayload = a.payload as any;
        return Object.values(actualPayload).includes(t.id);
      });

      const totalActualValue = linkedActuals.reduce((sum, act) => {
        const actPayload = act.payload as any;
        return sum + (Number(actPayload[actualFieldName]) || 0);
      }, 0);

      const gap = totalActualValue - targetValue;
      const achievementRate = targetValue > 0 ? (totalActualValue / targetValue) * 100 : 0;

      return {
        targetReference: targetReference, 
        objectiveValue: targetValue,
        actualAchieved: totalActualValue,
        variance: gap,
        performanceRate: parseFloat(achievementRate.toFixed(2)) + "%"
      };
    });

    return {
      targetFormId,
      actualFormId,
      crossAnalysisTable: analysis
    };
  }
}