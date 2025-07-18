import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-angular';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-notification-center',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss',
})
export class NotificationCenterComponent {
  isOpen = false;

  // Icons
  Bell = Bell;
  X = X;
  AlertCircle = AlertCircle;
  CheckCircle = CheckCircle;
  Info = Info;
  AlertTriangle = AlertTriangle;

  notifications: Notification[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Nouveau processus en attente',
      message: "Un nouveau processus d'apurement nécessite votre attention.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Délai de traitement',
      message: 'Le processus #12345 approche de la date limite.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: '3',
      type: 'success',
      title: 'Processus validé',
      message: 'Le processus #12344 a été validé avec succès.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  ngOnInit() {
    // Simulate real-time notifications
    this.simulateNotifications();
  }

  toggleNotifications() {
    this.isOpen = !this.isOpen;
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  private simulateNotifications() {
    // Simulate new notifications every 30 seconds
    setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance
        this.addNotification({
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'info' : 'warning',
          title: 'Nouvelle notification',
          message: 'Une nouvelle activité nécessite votre attention.',
          timestamp: new Date(),
          read: false,
        });
      }
    }, 30000);
  }

  private addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }
  }
}
