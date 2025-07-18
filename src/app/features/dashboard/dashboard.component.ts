import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { finalize } from 'rxjs/operators';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Activity
} from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { DashboardService } from '../../shared/services/dashboard.service';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface StatusDistribution {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Icons
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly RefreshCw = RefreshCw;
  readonly Download = Download;
  readonly Upload = Upload;
  readonly BarChart3 = BarChart3;
  readonly Activity = Activity;

  // États de chargement
  isLoadingKPIs = true;
  isLoadingActivities = true;
  isLoadingCharts = true;
  isRefreshing = false;

  // Données
  lastUpdate = new Date();
  pendingProcessCount = 12;

  kpis: KPI[] = [];
  recentActivities: RecentActivity[] = [];
  statusDistribution: StatusDistribution[] = [];

  constructor(
    private apiService: ApiService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadRealTimeData();
  }

  private loadDashboardData() {
    this.isLoadingKPIs = true;
    
    // Charger les statistiques depuis l'API
    this.apiService.getDashboardStats()
      .pipe(finalize(() => this.isLoadingKPIs = false))
      .subscribe({
        next: (stats) => {
          this.updateKPIs(stats);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des statistiques:', error);
          this.loadMockKPIs(); // Fallback vers les données simulées
        }
      });
  }

  private loadRealTimeData() {
    // Charger les activités récentes
    this.dashboardService.getRecentActivities()
      .subscribe(activities => {
        this.recentActivities = activities;
        this.isLoadingActivities = false;
      });

    // Charger la distribution des statuts
    this.dashboardService.getStatusDistribution()
      .subscribe(distribution => {
        this.statusDistribution = distribution;
        this.isLoadingCharts = false;
      });
  }

  private updateKPIs(stats: any) {
    this.kpis = [
      {
        label: 'Processus en cours',
        value: stats.processusEnCours?.toString() || '247',
        change: stats.changeProcessus || '+12%',
        trend: 'up',
        icon: this.FileText,
        color: 'bg-blue-500'
      },
      {
        label: 'Taux de conformité',
        value: stats.tauxConformite || '94.2%',
        change: stats.changeTauxConformite || '+2.1%',
        trend: 'up',
        icon: this.CheckCircle,
        color: 'bg-green-500'
      },
      {
        label: 'Délai moyen',
        value: stats.delaiMoyen || '3.2j',
        change: stats.changeDelai || '-0.5j',
        trend: 'up',
        icon: this.Clock,
        color: 'bg-yellow-500'
      },
      {
        label: 'Montant total',
        value: stats.montantTotal || '2.4M €',
        change: stats.changeMontant || '+18%',
        trend: 'up',
        icon: this.DollarSign,
        color: 'bg-afriland-600'
      }
    ];
  }

  private loadMockKPIs() {
    this.kpis = [
      {
        label: 'Processus en cours',
        value: '247',
        change: '+12%',
        trend: 'up',
        icon: this.FileText,
        color: 'bg-blue-500'
      },
      {
        label: 'Taux de conformité',
        value: '94.2%',
        change: '+2.1%',
        trend: 'up',
        icon: this.CheckCircle,
        color: 'bg-green-500'
      },
      {
        label: 'Délai moyen',
        value: '3.2j',
        change: '-0.5j',
        trend: 'up',
        icon: this.Clock,
        color: 'bg-yellow-500'
      },
      {
        label: 'Montant total',
        value: '2.4M €',
        change: '+18%',
        trend: 'up',
        icon: this.DollarSign,
        color: 'bg-afriland-600'
      }
    ];
  }

  trackByKpi(index: number, kpi: KPI): string {
    return kpi.label;
  }

  trackByActivity(index: number, activity: RecentActivity): string {
    return activity.id;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `il y a ${minutes}min`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${days}j`;
  }

  refreshData() {
    this.isRefreshing = true;
    this.lastUpdate = new Date();
    
    this.dashboardService.refreshData()
      .pipe(finalize(() => this.isRefreshing = false))
      .subscribe({
        next: () => {
          this.loadDashboardData();
          this.loadRealTimeData();
        },
        error: (error) => {
          console.error('Erreur lors du rafraîchissement:', error);
        }
      });
  }

  getActivityIcon(type: string): any {
    const icons: { [key: string]: any } = {
      'Nouveau processus': this.FileText,
      'Validation': this.CheckCircle,
      'Alerte': this.AlertTriangle,
      'Rejet': this.AlertTriangle,
      'Import': this.Upload,
      'Export': this.Download,
      'Assignation': this.Users,
      'Modification': this.Activity
    };
    return icons[type] || this.Activity;
  }

  // Méthodes pour l'intégration avec le backend
  triggerEmailSend() {
    this.apiService.sendEmailToClients()
      .subscribe({
        next: (count) => {
          console.log(`${count} emails envoyés`);
          // Afficher une notification de succès
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi des emails:', error);
        }
      });
  }

  startDataImport() {
    this.apiService.telechargerDocument()
      .subscribe({
        next: (result) => {
          console.log('Import démarré:', result);
          // Rediriger vers la page d'import ou afficher le statut
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de l\'import:', error);
        }
      });
  }
}
