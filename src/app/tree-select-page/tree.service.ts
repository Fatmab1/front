import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TreeNode } from 'primeng/api';

export interface Sensor {
  id_sensor: number;
  type: string;
}

export interface Machine {
  machine: string;
  capteurs: Sensor[];
}

export interface Workshop {
  workshop: string;
  machines: Machine[];
}

export interface UniteFabrication {
  uniteFabrications: string;  // Fixed typo from "uniteFabrications" to "uniteFabrications"
  workshops: Workshop[];
}

export interface Usine {
  usine: string;
  uniteFabrications: UniteFabrication[];
}

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private readonly apiUrl = 'http://localhost:3000/usines/initialize';

  constructor(private http: HttpClient) {}

  getTreeNodes(): Observable<Usine[]> {
    return this.http.get<Usine[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des données:', error);
        return throwError(() => new Error('Erreur de chargement des données.'));
      })
    );
  }

  transformToTreeNode(usines: Usine[] | undefined): TreeNode[] {
    if (!usines || !Array.isArray(usines)) {
      console.error('Données invalides pour transformer en TreeNode:', usines);
      return [];
    }

    return usines.map(usine => ({
      key: `usine_${usine.usine}`,
      label: usine.usine,
      icon: 'pi pi-building',
      children: usine.uniteFabrications?.map(unite => ({
        key: `unite_${unite.uniteFabrications}`,
        label: unite.uniteFabrications,
        icon: 'pi pi-cog',
        children: unite.workshops?.map(workshop => ({
          key: `workshop_${workshop.workshop}`,
          label: workshop.workshop,
          icon: 'pi pi-wrench',
          children: workshop.machines?.map(machine => ({
            key: `machine_${machine.machine}`,
            label: machine.machine,
            icon: 'pi pi-cog',
            children: machine.capteurs?.map(sensor => ({
              key: `sensor_${sensor.id_sensor}`,
              label: `${sensor.type} (ID: ${sensor.id_sensor})`,
              icon: 'pi pi-microchip',
              data: { ...sensor }
            })) || []
          })) || []
        })) || []
      })) || []
    }));
  }

  addNode(node: any, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/addNode`, { node, type }).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout du nœud:', error);
        return throwError(() => new Error('Échec de l\'ajout du nœud.'));
      })
    );
  }

  deleteNode(node: any, type: string): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/deleteNode`, { 
      body: { node, type } 
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression du nœud:', error);
        return throwError(() => new Error('Échec de la suppression du nœud.'));
      })
    );
  }
}