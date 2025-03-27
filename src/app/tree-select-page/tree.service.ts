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
  uniteFabrications: string;
  workshops: Workshop[];
}

export interface Usine {
  usine: string;
  uniteFabrications: UniteFabrication[];
}

export interface NodeAddRequest {
  parentNode: any;
  name: string;
  type: string;
  parentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private readonly apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  getTreeNodes(): Observable<Usine[]> {
    return this.http.get<Usine[]>(`${this.apiUrl}usines/initialize`).pipe(
      catchError(this.handleError('Erreur de chargement des données'))
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
      type: 'Usine',
      icon: 'pi pi-building',
      children: usine.uniteFabrications?.map(unite => ({
        key: `unite_${unite.uniteFabrications}`,
        label: unite.uniteFabrications,
        type: 'Unité de Fabrication',
        icon: 'pi pi-cog',
        children: unite.workshops?.map(workshop => ({
          key: `workshop_${workshop.workshop}`,
          label: workshop.workshop,
          type: 'Atelier',
          icon: 'pi pi-wrench',
          children: workshop.machines?.map(machine => ({
            key: `machine_${machine.machine}`,
            label: machine.machine,
            type: 'Machine',
            icon: 'pi pi-cog',
            children: machine.capteurs?.map(sensor => ({
              key: `sensor_${sensor.id_sensor}`,
              label: `${sensor.type} (ID: ${sensor.id_sensor})`,
              type: 'Capteur',
              icon: 'pi pi-microchip',
              data: { ...sensor }
            })) || []
          })) || []
        })) || []
      })) || []
    }));
  }

  addNode(nodeData: NodeAddRequest): Observable<any> {

    // Prepare the node data for backend
    const preparedNodeData = {
      parentNode: nodeData.parentNode ? { label: nodeData.parentNode.label } : null,
      name: nodeData.name,
      type: nodeData.type,
      parentType: nodeData.parentType
    };
    console.log("Node Data preparedNodeData:", preparedNodeData);


    return this.http.post(`${this.apiUrl}usines/addNode`, preparedNodeData).pipe(
      catchError(this.handleError('Échec de l\'ajout du nœud'))
    );
  }

  deleteNode(node: any, type: string): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}usines/deleteNode`, { 
      body: { node, type } 
    }).pipe(
      catchError(this.handleError('Échec de la suppression du nœud'))
    );
  }

  // Generic error handler
  private handleError(message: string) {
    return (error: any) => {
      console.error(message, error);
      return throwError(() => new Error(message));
    };
  }
}