import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MenuItem, MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { TreeService } from './tree.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddNodeDialogComponent } from './add-node-dialog/add-node-dialog.component';
import { firstValueFrom } from 'rxjs';

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
  providers: [MessageService, DialogService]
})
export class TreeSelectPageComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  treeData: TreeNode[] = [];
  isLoading = true;
  selectedNode: TreeNode | null = null;
  contextMenuItems: MenuItem[] = [];
  contextMenuNode: TreeNode | null = null;
  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private fb: FormBuilder,
    private treeService: TreeService,
    private messageService: MessageService,
    private dialogService: DialogService
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
    this.treeService.getTreeNodes().subscribe({
      next: (usines) => {
        this.treeData = this.treeService.transformToTreeNode(usines);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tree data:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tree data'
        });
      }
    });
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode = event.node;
    this.formGroup.patchValue({ selectedNode: event.node });
  }

  onContextMenu(event: MouseEvent, node: TreeNode): void {
    event.preventDefault();
    this.contextMenuNode = node;
  }

  private findAndRemoveNode(nodes: TreeNode[], nodeToRemove: TreeNode): boolean {
    const index = nodes.findIndex(node => node === nodeToRemove);
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

  private findParentNode(nodes: TreeNode[], childNode: TreeNode): TreeNode | null {
    for (const node of nodes) {
      if (node.children?.includes(childNode)) {
        return node;
      }
      const found = this.findParentNode(node.children || [], childNode);
      if (found) return found;
    }
    return null;
  }

  onSubmit(): void {
    if (this.formGroup.invalid || !this.selectedNode) {
      this.formGroup.markAllAsTouched();
      return;
    }

    console.log('Form submitted with:', {
      selectedNode: this.selectedNode,
      rawValue: this.formGroup.getRawValue()
    });
  }

  getNodeType(node: TreeNode): string {
    if (!node.key) return 'Unknown';
    
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
    return 'Unknown';
  }

  addNode(): void {
    console.log("salem");
    
    if (!this.contextMenuNode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No node selected for adding child'
      });
      return;
    }

    this.dialogRef = this.dialogService.open(AddNodeDialogComponent, {
      header: `Add Child to ${this.getNodeType(this.contextMenuNode)}`,
      width: '50%',
      data: {
        parentNode: this.contextMenuNode,
        nodeType: this.getNodeType(this.contextMenuNode)
      }
    });

    this.dialogRef.onClose.subscribe((newNodeData: unknown) => {
      if (newNodeData) {
        this.treeService.addNode(newNodeData, this.getNodeType(this.contextMenuNode!))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Node added successfully'
              });
              this.loadTreeData();
            },
            error: (err) => {
              console.error('Error adding node:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add node'
              });
            }
          });
      }
    });
  }

  async deleteNode(): Promise<void> {
    if (!this.contextMenuNode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No node selected for deletion'
      });
      return;
    }

    const nodeType = this.getNodeType(this.contextMenuNode);
    const confirmDelete = confirm(`Are you sure you want to delete this ${nodeType}?`);
    
    if (!confirmDelete) return;

    try {
      await firstValueFrom(
        this.treeService.deleteNode(this.contextMenuNode, nodeType)
      );
      
      const deleted = this.findAndRemoveNode(this.treeData, this.contextMenuNode);
      
      if (deleted) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Node deleted successfully'
        });
        
        if (this.selectedNode === this.contextMenuNode) {
          this.selectedNode = null;
          this.formGroup.patchValue({ selectedNode: null });
        }
        
        this.contextMenuNode = null;
        this.treeData = [...this.treeData];
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Node not found in local tree'
        });
      }
    } catch (err) {
      console.error('Error deleting node:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete node'
      });
      this.loadTreeData();
    }
  }
}