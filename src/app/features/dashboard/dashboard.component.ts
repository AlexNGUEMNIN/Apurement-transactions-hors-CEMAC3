import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
} from 'lucide-angular';

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
getActivityIcon(arg0: string): import("lucide-angular").LucideIconData|undefined {
throw new Error('Method not implemented.');
}
  // Icons
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly DollarSign = DollarSign;

  // États de chargement
  isLoadingKPIs = true;
  isLoadingActivities = true;
  isLoadingCharts = true;

  // Données
  lastUpdate = new Date();
  pendingProcessCount = 12;

  kpis: KPI[] = [];
  recentActivities: RecentActivity[] = [];
  statusDistribution: StatusDistribution[] = [];
Math: any;
BarChart3: LucideIconData|undefined;
processStatus: any;

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Simulation du chargement des KPIs
    setTimeout(() => {
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
      this.isLoadingKPIs = false;
    }, 1500);

    // Simulation du chargement des activités
    setTimeout(() => {
      this.recentActivities = [
        {
          id: '1',
          type: 'Nouveau processus',
          description: 'Processus APU-2024-001 soumis par Jean Dupont',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'info'
        },
        {
          id: '2',
          type: 'Validation',
          description: 'Processus APU-2024-002 validé avec succès',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'success'
        },
        {
          id: '3',
          type: 'Alerte',
          description: 'Processus APU-2024-003 nécessite une attention',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'warning'
        },
        {
          id: '4',
          type: 'Rejet',
          description: 'Processus APU-2024-004 rejeté - documents manquants',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'error'
        },
        {
          id: '5',
          type: 'Import',
          description: 'Import Excel de 150 transactions terminé',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          status: 'success'
        }
      ];
      this.isLoadingActivities = false;
    }, 2000);

    // Simulation du chargement des graphiques
    setTimeout(() => {
      this.statusDistribution = [
        { label: 'En attente', count: 45, percentage: 35, color: 'bg-yellow-500' },
        { label: 'Assignés', count: 32, percentage: 25, color: 'bg-blue-500' },
        { label: 'Justifiés', count: 78, percentage: 60, color: 'bg-green-500' },
        { label: 'Rejetés', count: 12, percentage: 9, color: 'bg-red-500' }
      ];
      this.isLoadingCharts = false;
    }, 2500);
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
    this.isLoadingKPIs = true;
    this.isLoadingActivities = true;
    this.isLoadingCharts = true;
    this.lastUpdate = new Date();
    this.loadDashboardData();
  }
}
