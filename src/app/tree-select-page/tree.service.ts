import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private readonly apiUrl = 'http://localhost:3000/usines/initialize';

  constructor(private http: HttpClient) {}

  getTreeNodes(): Observable<Usine[]> {
    return this.http.get<Usine[]>(this.apiUrl);
  }

  transformToTreeNode(usines: Usine[]): TreeNode[] {
    return usines.map(usine => ({
      key: `usine_${usine.usine}`,
      label: usine.usine,
      icon: 'pi pi-factory',
      children: usine.uniteFabrications.map(unite => ({
        key: `unite_${unite.uniteFabrications}`,
        label: unite.uniteFabrications,
        icon: 'pi pi-building',
        children: unite.workshops.map(workshop => ({
          key: `workshop_${workshop.workshop}`,
          label: workshop.workshop,
          icon: 'pi pi-map',
          children: workshop.machines.map(machine => ({
            key: `machine_${machine.machine}`,
            label: machine.machine,
            icon: 'pi pi-cog',
            children: machine.capteurs.map(sensor => ({
              key: `sensor_${sensor.id_sensor}`,
              label: `${sensor.type} (ID: ${sensor.id_sensor})`,
              icon: 'pi pi-microchip',
              data: { ...sensor }
            }))
          }))
        }))
      }))
    }));
  }
}