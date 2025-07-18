import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProcessusStats {
  total: number;
  enAttente: number;
  assigne: number;
  justifie: number;
  rejete: number;
  cloture: number;
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  userId?: string;
  userName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private processusStatsSubject = new BehaviorSubject<ProcessusStats>({
    total: 247,
    enAttente: 45,
    assigne: 32,
    justifie: 78,
    rejete: 12,
    cloture: 80,
  });

  private recentActivitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  private kpisSubject = new BehaviorSubject<KPI[]>([]);

  constructor() {
    this.initializeData();
    this.startRealTimeUpdates();
  }

  private initializeData() {
    // Initialize KPIs
    const initialKPIs: KPI[] = [
      {
        label: 'Processus en cours',
        value: '247',
        change: '+12%',
        trend: 'up',
        icon: 'FileText',
        color: 'bg-blue-500',
      },
      {
        label: 'Taux de conformité',
        value: '94.2%',
        change: '+2.1%',
        trend: 'up',
        icon: 'CheckCircle',
        color: 'bg-green-500',
      },
      {
        label: 'Délai moyen',
        value: '3.2j',
        change: '-0.5j',
        trend: 'up',
        icon: 'Clock',
        color: 'bg-yellow-500',
      },
      {
        label: 'Montant total',
        value: '2.4M €',
        change: '+18%',
        trend: 'up',
        icon: 'DollarSign',
        color: 'bg-afriland-600',
      },
    ];

    // Initialize recent activities
    const initialActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'Nouveau processus',
        description: 'Processus APU-2024-001 soumis par Jean Dupont',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'info',
        userId: 'user1',
        userName: 'Jean Dupont',
      },
      {
        id: '2',
        type: 'Validation',
        description: 'Processus APU-2024-002 validé avec succès',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success',
        userId: 'user2',
        userName: 'Marie Martin',
      },
      {
        id: '3',
        type: 'Alerte',
        description: 'Processus APU-2024-003 nécessite une attention',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'warning',
        userId: 'user3',
        userName: 'Pierre Dubois',
      },
      {
        id: '4',
        type: 'Rejet',
        description: 'Processus APU-2024-004 rejeté - documents manquants',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'error',
        userId: 'user4',
        userName: 'Sophie Laurent',
      },
      {
        id: '5',
        type: 'Import',
        description: 'Import Excel de 150 transactions terminé',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: 'success',
        userId: 'admin',
        userName: 'Administrateur',
      },
    ];

    this.kpisSubject.next(initialKPIs);
    this.recentActivitiesSubject.next(initialActivities);
  }

  private startRealTimeUpdates() {
    // Update data every 30 seconds to simulate real-time updates
    timer(30000, 30000).subscribe(() => {
      this.simulateDataUpdate();
    });
  }

  private simulateDataUpdate() {
    // Simulate KPI updates
    const currentKPIs = this.kpisSubject.value;
    const updatedKPIs = currentKPIs.map((kpi) => {
      const randomChange = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
      const newValue = this.calculateNewValue(kpi.value, randomChange);

      return {
        ...kpi,
        value: newValue,
        change: `${randomChange > 0 ? '+' : ''}${randomChange.toFixed(1)}%`,
        trend:
          randomChange > 0
            ? ('up' as const)
            : randomChange < 0
            ? ('down' as const)
            : ('stable' as const),
      };
    });

    this.kpisSubject.next(updatedKPIs);

    // Simulate new activity occasionally
    if (Math.random() < 0.3) {
      // 30% chance of new activity
      this.addNewActivity();
    }
  }

  private calculateNewValue(
    currentValue: string,
    changePercent: number
  ): string {
    if (currentValue.includes('%')) {
      const numValue = parseFloat(currentValue.replace('%', ''));
      const newValue = Math.max(
        0,
        Math.min(100, numValue + changePercent / 10)
      );
      return `${newValue.toFixed(1)}%`;
    } else if (currentValue.includes('j')) {
      const numValue = parseFloat(currentValue.replace('j', ''));
      const newValue = Math.max(0.1, numValue + changePercent / 100);
      return `${newValue.toFixed(1)}j`;
    } else if (currentValue.includes('M')) {
      const numValue = parseFloat(currentValue.replace('M €', ''));
      const newValue = Math.max(0, numValue + changePercent / 100);
      return `${newValue.toFixed(1)}M €`;
    } else {
      const numValue = parseInt(currentValue);
      const newValue = Math.max(
        0,
        Math.round(numValue + (numValue * changePercent) / 100)
      );
      return newValue.toString();
    }
  }

  private addNewActivity() {
    const activities = [
      'Nouveau processus soumis',
      'Processus validé',
      'Document ajouté',
      'Statut mis à jour',
      'Import terminé',
    ];

    const statuses: ('success' | 'warning' | 'error' | 'info')[] = [
      'success',
      'warning',
      'error',
      'info',
    ];
    const users = [
      'Jean Dupont',
      'Marie Martin',
      'Pierre Dubois',
      'Sophie Laurent',
      'Admin',
    ];

    const randomActivity =
      activities[Math.floor(Math.random() * activities.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const newActivity: RecentActivity = {
      id: Math.random().toString(36).substr(2, 9),
      type: randomActivity,
      description: `${randomActivity} par ${randomUser}`,
      timestamp: new Date(),
      status: randomStatus,
      userName: randomUser,
    };

    const currentActivities = this.recentActivitiesSubject.value;
    const updatedActivities = [newActivity, ...currentActivities.slice(0, 9)]; // Keep only last 10

    this.recentActivitiesSubject.next(updatedActivities);
  }

  // Public methods
  getKPIs(): Observable<KPI[]> {
    return this.kpisSubject.asObservable();
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    return this.recentActivitiesSubject.asObservable();
  }

  getProcessusStats(): Observable<ProcessusStats> {
    return this.processusStatsSubject.asObservable();
  }

  getStatusDistribution(): Observable<any[]> {
    return this.processusStatsSubject.pipe(
      map((stats) => [
        {
          label: 'En attente',
          count: stats.enAttente,
          percentage: (stats.enAttente / stats.total) * 100,
          color: 'bg-yellow-500',
        },
        {
          label: 'Assignés',
          count: stats.assigne,
          percentage: (stats.assigne / stats.total) * 100,
          color: 'bg-blue-500',
        },
        {
          label: 'Justifiés',
          count: stats.justifie,
          percentage: (stats.justifie / stats.total) * 100,
          color: 'bg-green-500',
        },
        {
          label: 'Rejetés',
          count: stats.rejete,
          percentage: (stats.rejete / stats.total) * 100,
          color: 'bg-red-500',
        },
        {
          label: 'Clôturés',
          count: stats.cloture,
          percentage: (stats.cloture / stats.total) * 100,
          color: 'bg-gray-500',
        },
      ])
    );
  }

  refreshData(): Observable<boolean> {
    // Simulate data refresh
    return new Observable((observer) => {
      setTimeout(() => {
        this.simulateDataUpdate();
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }
}
