import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormsModule, 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup,
  Validators 
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { TreeService } from './tree.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddNodeDialogComponent } from './add-node-dialog/add-node-dialog.component';
import { firstValueFrom, Subscription } from 'rxjs';
export interface NodeAddRequest {
  parentNode: any;
  name: string;
  type: string;
  parentType: string;
}
@Component({
  selector: 'app-tree-select-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TreeSelectModule,
    ButtonModule,
    ContextMenuModule
  ],
  templateUrl: './tree-select-page.component.html',
  styleUrls: ['./tree-select-page.component.css'],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class TreeSelectPageComponent implements OnInit, OnDestroy {
  @ViewChild('ctxMenuTarget', { static: false }) ctxMenuTarget!: ElementRef;
  
  formGroup: FormGroup;
  treeData: TreeNode[] = [];
  isLoading = true;
  selectedNode: TreeNode | null = null;
  contextMenuItems: MenuItem[] = [];
  contextMenuNode: TreeNode | null = null;
  
  private dialogRef: DynamicDialogRef | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private treeService: TreeService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    this.formGroup = this.fb.group({
      selectedNode: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTreeData();
    this.setupContextMenu();
  }

  ngOnDestroy(): void {
    this.dialogRef?.close();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupContextMenu(): void {
    this.contextMenuItems = [
      {
        label: 'Ajouter',
        icon: 'pi pi-plus',
        command: () => this.addNode()
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.deleteNode()
      }
    ];
  }

  loadTreeData(): void {
    this.isLoading = true;
    const sub = this.treeService.getTreeNodes().subscribe({
      next: (usines) => {
        this.treeData = this.treeService.transformToTreeNode(usines);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du chargement des données',
          life: 3000
        });
      }
    });
    this.subscriptions.push(sub);
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode = event.node;
    this.contextMenuNode = event.node;
    this.formGroup.patchValue({ selectedNode: event.node });
  }

  onContextMenu(event: MouseEvent, node: TreeNode): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuNode = node;
    this.selectedNode = node;
    this.formGroup.patchValue({ selectedNode: node });
  }

  private findAndRemoveNode(nodes: TreeNode[] | null, nodeToRemove: TreeNode | null): boolean {
    if (!nodes || !nodeToRemove) return false;

    const index = nodes.findIndex(node => node.key === nodeToRemove.key);
    if (index !== -1) {
      nodes.splice(index, 1);
      return true;
    }

    for (const node of nodes) {
      if (node.children && this.findAndRemoveNode(node.children, nodeToRemove)) {
        return true;
      }
    }
    return false;
  }

  onSubmit(): void {
    if (this.formGroup.invalid || !this.selectedNode) {
      this.formGroup.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner un élément',
        life: 3000
      });
      return;
    }

    console.log('Données soumises:', {
      selectedNode: this.selectedNode,
      rawValue: this.formGroup.getRawValue()
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Sélection enregistrée',
      life: 3000
    });
  }

  getNodeType(node: TreeNode | null): string {
    if (!node || !node.key) return 'Inconnu';
    
    const typeMap: Record<string, string> = {
      'usine_': 'Usine',
      'unite_': 'Unité de Fabrication',
      'workshop_': 'Atelier',
      'machine_': 'Machine',
      'sensor_': 'Capteur'
    };

    for (const [prefix, type] of Object.entries(typeMap)) {
      if (node.key.startsWith(prefix)) {
        return type;
      }
    }
    return 'Inconnu';
  }

  addNode(): void {
    if (!this.contextMenuNode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucun nœud sélectionné',
        life: 3000
      });
      return;
    }
  
    this.dialogRef = this.dialogService.open(AddNodeDialogComponent, {
      width: '50%',
      data: {
        parentNode: this.contextMenuNode,
        nodeType: this.getNodeType(this.contextMenuNode)
      }
    });
  
    const sub = this.dialogRef.onClose.subscribe((newNodeData: any) => {
      if (newNodeData) {
        // Prepare data to match NodeAddRequest interface
        const nodeAddRequest = {
          parentNode: this.contextMenuNode,
          name: newNodeData.name,
          type: newNodeData.type || this.getNodeType(this.contextMenuNode),
          parentType: this.getNodeType(this.contextMenuNode)
        };
  
        this.treeService.addNode(nodeAddRequest).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Nœud ajouté avec succès',
              life: 3000
            });
            this.loadTreeData();
          },
          error: (err) => {
            console.error("Erreur lors de l'ajout:", err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: "Échec de l'ajout du nœud",
              life: 3000
            });
          }
        });
      }
    });
    this.subscriptions.push(sub);
  }





  async deleteNode(): Promise<void> {
    if (!this.contextMenuNode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucun nœud sélectionné',
        life: 3000
      });
      return;
    }

    const nodeType = this.getNodeType(this.contextMenuNode);

    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer ce ${nodeType} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: async () => {
        try {
          // Uncomment when backend is ready
          // await firstValueFrom(
          //   this.treeService.deleteNode(this.contextMenuNode!, nodeType)
          // );
          
          const deleted = this.findAndRemoveNode(this.treeData, this.contextMenuNode);
          
          if (deleted) {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Nœud supprimé avec succès',
              life: 3000
            });

            if (this.selectedNode?.key === this.contextMenuNode?.key) {
              this.selectedNode = null;
              this.formGroup.reset();
            }
            
            this.contextMenuNode = null;
            this.treeData = [...this.treeData];
          }
        } catch (err) {
          console.error('Erreur lors de la suppression:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la suppression',
            life: 3000
          });
          this.loadTreeData();
        }
      }
    });
  }
}