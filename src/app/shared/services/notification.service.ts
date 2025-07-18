import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  actionUrl?: string;
  actionText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Simulation de notifications initiales
    this.initializeNotifications();
  }

  private initializeNotifications() {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Nouveau processus',
        message: 'Le processus APU-2024-001 a été soumis par Jean Dupont',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        actionUrl: '/processus/APU-2024-001',
        actionText: 'Voir le processus',
      },
      {
        id: '2',
        type: 'success',
        title: 'Validation réussie',
        message: 'Le processus APU-2024-002 a été validé avec succès',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        actionUrl: '/processus/APU-2024-002',
        actionText: 'Voir les détails',
      },
      {
        id: '3',
        type: 'warning',
        title: 'Attention requise',
        message: 'Le processus APU-2024-003 nécessite votre attention',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: '/processus/APU-2024-003',
        actionText: 'Examiner',
      },
      {
        id: '4',
        type: 'error',
        title: 'Processus rejeté',
        message: 'Le processus APU-2024-004 a été rejeté - documents manquants',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        actionUrl: '/processus/APU-2024-004',
        actionText: 'Corriger',
      },
    ];

    this.notificationsSubject.next(initialNotifications);
    this.updateUnreadCount();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications];

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      (notification) => notification.id !== notificationId
    );

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  private updateUnreadCount(): void {
    const currentNotifications = this.notificationsSubject.value;
    const unreadCount = currentNotifications.filter((n) => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Simulation d'arrivée de nouvelles notifications
  simulateNewNotification(): void {
    const types: ('success' | 'warning' | 'error' | 'info')[] = [
      'success',
      'warning',
      'error',
      'info',
    ];
    const messages = [
      'Un nouveau processus a été soumis',
      'Un processus nécessite votre validation',
      'Une erreur a été détectée dans un processus',
      'Un import Excel a été terminé',
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    this.addNotification({
      type: randomType,
      title: 'Nouvelle notification',
      message: randomMessage,
      actionUrl: '/processus',
      actionText: 'Voir',
    });
  }
}
