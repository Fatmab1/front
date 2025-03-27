import { Component, OnInit } from '@angular/core';
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
import { MenuItem } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { TreeService } from './tree.service';

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
  styleUrls: ['./tree-select-page.component.css']
})
export class TreeSelectPageComponent implements OnInit {
  formGroup: FormGroup;
  treeData: TreeNode[] = [];
  isLoading = true;
  selectedNode: TreeNode | undefined;
  contextMenuItems: MenuItem[] = [];
  contextMenuNode: TreeNode | null = null;

  constructor(
    private fb: FormBuilder,
    private treeService: TreeService
  ) {
    this.formGroup = this.fb.group({
      selectedNode: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTreeData();
    this.setupContextMenu();
  }

  setupContextMenu(): void {
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
      }
    });
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode = event.node;
    this.formGroup.get('selectedNode')?.setValue(event.node);
    console.log('Selected Node:', this.selectedNode);
  }

  onContextMenu(event: MouseEvent, node: TreeNode): void {
    event.preventDefault();
    this.contextMenuNode = node;
  }



  findAndRemoveNode(nodes: TreeNode[], nodeToRemove: TreeNode): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] === nodeToRemove) {
        nodes.splice(i, 1);
        return true;
      }

      if (nodes[i].children) {
        if (this.findAndRemoveNode(nodes[i].children!, nodeToRemove)) {
          return true;
        }
      }
    }
    return false;
  }

  onSubmit(): void {
    if (this.formGroup.invalid || !this.selectedNode) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formData = {
      selectedNode: this.selectedNode,
      rawValue: this.formGroup.getRawValue()
    };
    console.log('Form submitted with:', formData);
  }

  getNodeType(node: TreeNode): string {
    if (!node.key) return 'Unknown';
    
    const typeMap: Record<string, string> = {
      'usine': 'Usine',
      'unite': 'Unité de Fabrication',
      'workshop': 'Atelier',
      'machine': 'Machine',
      'sensor': 'Capteur'
    };

    const typeKey = Object.keys(typeMap).find(key => node.key?.startsWith(key));
    return typeKey ? typeMap[typeKey] : 'Unknown';
  }

  addNode(): void {    

  }

  async deleteNode(): Promise<void> {
    if (!this.contextMenuNode) {
      alert('No node selected for deletion');
      return;
    }
  
    // // Confirm deletion with the user
    // const confirmDelete = window.confirm(`Are you sure you want to delete the ${this.getNodeType(this.contextMenuNode)} node?`);
    
    // if (confirmDelete) {
    //   // Remove the node from the tree data
    //   const deleted = this.findAndRemoveNode(this.treeData, this.contextMenuNode);
  
    //   if (deleted) {
    //     // Call service method to delete node from backend
    //     (await this.treeService.deleteNode(this.contextMenuNode.key)).subscribe({
    //       next: () => {
    //         // Reset selected node if it was the deleted node
    //         if (this.selectedNode === this.contextMenuNode) {
    //           this.selectedNode = undefined;
    //           this.formGroup.get('selectedNode')?.setValue(null);
    //         }
  
    //         // Reset context menu node
    //         this.contextMenuNode = null;
  
    //         // Trigger change detection
    //         this.treeData = [...this.treeData];
  
    //         console.log('Node deleted successfully');
    //       },
    //       error: (err : any) => {
    //         console.error('Error deleting node:', err);
    //         // Optionally, revert the local deletion if backend fails
    //         this.loadTreeData();
    //       }
    //     });
    //   } else {
    //     console.warn('Node not found in tree');
    //   }
    // }
  }
}