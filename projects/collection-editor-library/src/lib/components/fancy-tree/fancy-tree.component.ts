import {
  Component, AfterViewInit, Input, ViewChild, ElementRef, Output, EventEmitter,
  OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef
} from '@angular/core';
import 'jquery.fancytree';
import * as _ from 'lodash-es';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';
import { HelperService } from '../../services/helper/helper.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { ConfigService } from '../../services/config/config.service';
import {  DialcodeService } from '../../services/dialcode/dialcode.service';


import { Subject } from 'rxjs';
import { UUID } from 'angular2-uuid';
declare var $: any;

@Component({
  selector: 'lib-fancy-tree',
  templateUrl: './fancy-tree.component.html',
  styleUrls: ['./fancy-tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FancyTreeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fancyTree') public tree: ElementRef;
  @Input() public nodes: any;
  @Input() public options: any;
  @Input( ) buttonLoaders: any;
  @Output() public treeEventEmitter: EventEmitter<any> = new EventEmitter();
  public config: any;
  public showTree: boolean;
  public visibility: any;
  public showAddChildButton: boolean;
  public showAddSiblingButton: boolean;
  public rootNode: any;
  public showLibraryButton = false;
  public unsubscribe$ = new Subject<void>();
  public bulkUploadProcessingStatus = false;
  public nodeParentDependentMap = {};
  public treeData: any = [];
  public branchingObject = {};
  public rootMenuTemplate = `<span class="ui dropdown sb-dotted-dropdown" autoclose="itemClick" suidropdown="" tabindex="0">
  <span id="contextMenu" class="p-0 w-auto"><i class="icon ellipsis vertical sb-color-black"></i></span>
  <span id= "contextMenuDropDown" class="menu transition hidden" suidropdownmenu="" style="">
    <div id="addchild" class="item">Add Child</div>
  </span>
  </span>`;
  public folderMenuTemplate = `<span id= "removeNodeIcon"> <i class="fa fa-trash-o" type="button"></i> </span><span class="ui dropdown sb-dotted-dropdown" autoclose="itemClick" suidropdown="" tabindex="0">
  <span id="contextMenu" class="p-0 w-auto"><i class="icon ellipsis vertical sb-color-black"></i></span>
  <span id= "contextMenuDropDown" class="menu transition hidden" suidropdownmenu="" style="">
    <div id="addsibling" class="item">Add Sibling</div>
    <div id="addchild" class="item">Add Child</div>
    <div id="delete" class="item">Delete</div>
  </span>
  </span>`;
  // tslint:disable-next-line:max-line-length
  public contentMenuTemplate = `<span id="contextMenu"><span id= "removeNodeIcon" type="content" > <i class="fa fa-trash-o" type="button"></i> </span></span>`;
  constructor(public treeService: TreeService, private editorService: EditorService,
              public telemetryService: EditorTelemetryService, private helperService: HelperService,
              private toasterService: ToasterService, private cdr: ChangeDetectorRef,
              public configService: ConfigService, private dialcodeService: DialcodeService) { }
  private onComponentDestroy$ = new Subject<any>();

  ngOnInit() {
    this.config = _.cloneDeep(this.editorService.editorConfig.config);
    this.config.mode =  _.get(this.config, 'mode').toLowerCase();
    if (!_.has(this.config, 'maxDepth')) { // TODO:: rethink this
      this.config.maxDepth = 4;
    }
    this.editorService.bulkUploadStatus$.subscribe((status) => {
      if (status === 'processing') {
        this.bulkUploadProcessingStatus = true;
      } else {
        this.bulkUploadProcessingStatus = false;
      }
    });
    this.initialize();
  }

  ngAfterViewInit() {
    this.renderTree(this.getTreeConfig());
  }

  initialize() {
    const data = this.nodes.data;
    this.nodeParentDependentMap = this.editorService.getParentDependentMap(this.nodes.data);
    let treeData;
    if (_.get(this.editorService, 'editorConfig.config.renderTaxonomy') === true && _.isEmpty(_.get(this.nodes, 'data.children'))) {
      this.helperService.addDepthToHierarchy(this.nodes.data.children);
      this.nodes.data.children =   this.removeIntermediateLevelsFromFramework(this.nodes.data.children);
      treeData = this.buildTreeFromFramework(this.nodes.data);
    } else {
      treeData = this.buildTree(this.nodes.data);
    }
    this.editorService.treeData = treeData;
    this.rootNode = [{
      id: data.identifier || UUID.UUID(),
      title: data.name,
      tooltip: data.name,
      ...(data.contentType && {contentType: data.contentType}),
      primaryCategory: data.primaryCategory,
      objectType: data.objectType,
      metadata: _.omit(data, ['children', 'collections']),
      folder: true,
      children: treeData,
      root: true,
      icon: _.get(this.config, 'iconClass')
    }];
  }

  buildTreeFromFramework(data, tree?, level?) {
    tree = tree || [];
    if (data.children) { data.children = _.sortBy(data.children, ['index']); }
    _.forEach(data.children, (child) => {
      const childTree = [];
      tree.push({
        id: UUID.UUID(),
        title: child.name,
        tooltip: child.name,
        primaryCategory: child.primaryCategory,
        metadata: _.omit(child, ['children', 'collections']),
        folder: true,
        children: childTree,
        root: false,
        icon: 'fa fa-folder-o'
      });
      if (child.children) {
        this.buildTreeFromFramework(child, childTree);
      }
    });
    return tree;
  }

  removeIntermediateLevelsFromFramework(data, parentData?) {
    const tree = [];
    _.forEach(data, child => {
      if (child.depth === 0 || child.depth === this.helperService.treeDepth) {
        const node = {
          ..._.omit(child, ['children']),
          ...(child.children && {children: this.removeIntermediateLevelsFromFramework(child.children, child)})
        };
        tree.push(
          node
        );
      } else if ((child.depth !== 0 || child.depth !== this.helperService.treeDepth)) {
        parentData.children  = _.filter(parentData.children, item => (item.depth === 0 || item.depth === this.helperService.treeDepth));
        if (child.children && child.children.length > 0) {
          const children = this.removeIntermediateLevelsFromFramework(child.children, child);
          parentData.children = _.concat(parentData.children, children);
        } else {
          parentData.children = _.concat(parentData.children, child.children);
        }
      }
    });
    return !_.isEmpty(tree) ? tree : _.flatten(parentData.children);
  }

  buildTree(data, tree?, level?) {
    tree = tree || [];
    if (data.children) { data.children = _.sortBy(data.children, ['index']); }
    data.level = level ? (level + 1) : 1;
    _.forEach(data.children, (child) => {
      const childTree = [];
      tree.push({
        id: child.identifier || UUID.UUID(),
        title: child.name,
        tooltip: child.name,
        ...(child.contentType && {contentType: child.contentType}),
        primaryCategory: child.primaryCategory,
        objectType: child.objectType,
        metadata: _.omit(child, ['children', 'collections']),
        folder: this.isFolder(child),
        children: childTree,
        root: false,
        extraClasses: !_.isEmpty(this.nodeParentDependentMap[child.identifier]) ? this.nodeParentDependentMap[child.identifier] : '',
        icon: this.getIconClass(child, data.level)
      });
      if (child.visibility === 'Parent') {
        this.buildTree(child, childTree, data.level);
      }
    });
    return tree;
  }

  isFolder(child: any) {
    if (this.isContent(child)) {
      return false;
    } else {
      return child.visibility === 'Parent' ? true : false;
    }
  }

  getIconClass(child: any, level: number) {
    if (this.isContent(child)) {
      return 'fa fa-file-o';
    } else if (child.visibility === 'Parent') {
        return _.get(this.config, `hierarchy.level.${level}.iconClass`) || 'fa fa-folder-o';
    } else {
      return 'fa fa-file-o';
    }
  }

  isContent(child: any) {
    // tslint:disable-next-line:max-line-length
    return (_.get(this.config, 'objectType') === 'QuestionSet' && child.objectType === 'Question');
  }

  renderTree(options) {
    options = { ...options, ...this.options };
    $(this.tree.nativeElement).fancytree(options);
    this.treeService.setTreeElement(this.tree.nativeElement);
    if (this.options.showConnectors) {
      $('.fancytree-container').addClass('fancytree-connectors');
    }
    setTimeout(() => {
      this.treeService.reloadTree(this.rootNode);
      const previousNode = this.treeService.getNodeById(this.treeService.previousNode);
      if (!_.isEmpty(previousNode)) {
        this.treeService.setActiveNode(previousNode);
      }
      if (_.get(previousNode, 'folder') !== true) {
        const prevNodeParent = this.treeService.getParent();
        if (!_.isEmpty(prevNodeParent.data)) {
          this.treeService.setActiveNode(prevNodeParent);
        }
      }
      const rootNode = this.treeService.getFirstChild();
      rootNode.setExpanded(true);
      this.eachNodeActionButton(rootNode);
      this.dialcodeService.readExistingQrCode();
      this.treeService.nextTreeStatus('loaded');
      this.showTree = true;
    });
    if (_.get(this.editorService, 'editorConfig.config.renderTaxonomy') === true && _.isEmpty(_.get(this.nodes, 'data.children'))) {
      _.forEach(this.rootNode[0]?.children, (child) => {
          this.treeService.updateTreeNodeMetadata(child.metadata, child.id, child.primaryCategory, child.objectType);
          _.forEach(child.children, (el) => {
            this.treeService.updateTreeNodeMetadata(el.metadata, el.id, el.primaryCategory, el.objectType);
          });
      });
    }
  }

  getTreeConfig() {
    const options: any = {
      extensions: ['glyph', 'dnd5'],
      clickFolderMode: 3,
      source: this.rootNode,
      escapeTitles: true,
      glyph: {
        preset: 'awesome4',
        map: {
          folder: 'icon folder sb-fancyTree-icon',
          folderOpen: 'icon folder outline sb-fancyTree-icon'
        }
      },
      dnd5: {
        autoExpandMS: 400,
        // focusOnClick: true,
        preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
        preventRecursion: true, // Prevent dropping nodes on own descendants
        dragStart: (node, data) => {
          /** This function MUST be defined to enable dragging for the tree.
           *  Return false to cancel dragging of node.
           */
          const draggable = _.get(this.config, 'mode') === 'edit' ? true : false;
          return draggable;
        },
        dragEnter: (node, data) => {
          /** data.otherNode may be null for non-fancytree droppables.
           *  Return false to disallow dropping on node. In this case
           *  dragOver and dragLeave are not called.
           *  Return 'over', 'before, or 'after' to force a hitMode.
           *  Return ['before', 'after'] to restrict available hitModes.
           *  Any other return value will calc the hitMode from the cursor position.
           */
          // Prevent dropping a parent below another parent (only sort
          // nodes under the same parent)
          /*           if(node.parent !== data.otherNode.parent){
                      return false;
                    }
                    // Don't allow dropping *over* a node (would create a child)
                    return ["before", "after"];
          */
          return true;
        },
        dragDrop: (node, data) => {
          /** This function MUST be defined to enable dropping of items on
           *  the tree.
           */
          // data.otherNode.moveTo(node, data.hitMode);
          return this.dragDrop(node, data);
        },
        filter: {
          autoApply: true,
          autoExpand: false,
          counter: true,
          fuzzy: false,
          hideExpandedCounter: true,
          hideExpanders: false,
          highlight: true,
          leavesOnly: false,
          nodata: true,
          mode: 'dimm'
        }
      },
      init: (event, data) => { },
      click: (event, data): boolean => {
        this.tree.nativeElement.click();
        this.telemetryService.interact({ edata: this.getTelemetryInteractEdata() });
        return true;
      },
      activate: (event, data) => {
        this.treeEventEmitter.emit({ type: 'nodeSelect', data: data.node });
        this.treeService.previousNode = _.get(data, 'node.data.id');
        setTimeout(() => {
          this.attachContextMenu(data.node, true);
          this.eachNodeActionButton(data.node);
        }, 10);
      },
      renderNode: (event, data) => {
        const node = data.node;
        const $nodeSpan = $(node.span);

        // check if span of node already rendered
        if (!$nodeSpan.data('rendered')) {
          this.attachContextMenu(node);
          // span rendered
          $nodeSpan.data('rendered', true);
        }
      }
    };
    return options;
  }

  eachNodeActionButton(node) {
    this.visibility = {};
    if (this.bulkUploadProcessingStatus) {
    this.visibility.addChild = false;
    this.visibility.addSibling =  false;
    this.visibility.addFromLibrary =  false;
    this.visibility.addQuestionFromLibrary = false;
    this.visibility.createNew =  false;
    } else {
      const nodeLevel = node.getLevel() - 1;
      this.visibility.addChild = ((node.folder === false) || (nodeLevel >= this.config.maxDepth)) ? false : true;
      // tslint:disable-next-line:max-line-length
      this.visibility.addSibling = ((node.folder === true) && (!node.data.root) && !((node.getLevel() - 1) > this.config.maxDepth)) ? true : false;
      if (nodeLevel === 0) {
        this.visibility.addFromLibrary = _.isEmpty(_.get(this.config, 'children')) || _.get(this.config, 'enableQuestionCreation') === false ? false : true;
        this.visibility.createNew = _.isEmpty(_.get(this.config, 'children')) || _.get(this.config, 'enableQuestionCreation') === false ? false : true;
        this.visibility.addQuestionFromLibrary = !_.isEmpty(_.get(this.config, 'children')) && _.get(this.config, 'enableAddFromLibrary') === true ? true : false;
      } else {
        const hierarchylevelData = this.config.hierarchy[`level${nodeLevel}`];
        // tslint:disable-next-line:max-line-length
        this.visibility.addFromLibrary = ((node.folder === false) || _.isEmpty(_.get(hierarchylevelData, 'children')) || _.get(this.config, 'enableQuestionCreation') === false) ? false : true;
        // tslint:disable-next-line:max-line-length
        this.visibility.createNew = ((node.folder === false) || _.isEmpty(_.get(hierarchylevelData, 'children')) || _.get(this.config, 'enableQuestionCreation') === false) ? false : true;
        this.visibility.addQuestionFromLibrary = ((node.folder === true) && !_.isEmpty(_.get(hierarchylevelData, 'children')) && _.get(this.config, 'enableAddFromLibrary') === true) ? true : false;
      }
    }
    if (_.get(this.editorService, 'editorConfig.config.renderTaxonomy') === true) {
      this.visibility.addChild = false;
      this.visibility.addSibling = false;
    }
    this.cdr.detectChanges();
  }

  addChild() {
    this.telemetryService.interact({ edata: this.getTelemetryInteractEdata('add_child') });
    const tree = $(this.tree.nativeElement).fancytree('getTree');
    const nodeConfig = this.config.hierarchy[tree.getActiveNode().getLevel()];
    const childrenTypes = _.get(nodeConfig, 'children.Content');
    if ((((tree.getActiveNode().getLevel() - 1) >= this.config.maxDepth))) {
      return this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.007'));
    }
    this.treeService.addNode('child');
  }

  addSibling() {
    this.telemetryService.interact({ edata: this.getTelemetryInteractEdata('add_sibling') });
    const tree = $(this.tree.nativeElement).fancytree('getTree');

    const node = tree.getActiveNode();
    if (!node.data.root) {
      this.treeService.addNode('sibling');
    } else {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.007'));
    }
  }

  getActiveNode() {
    return $(this.tree.nativeElement).fancytree('getTree').getActiveNode();
  }

  attachContextMenu(node, activeNode?) {
    // tslint:disable-next-line:max-line-length
    if (this.bulkUploadProcessingStatus || _.get(this.config, 'mode') !== 'edit' || (node.data.root === true && _.isEmpty(this.config.hierarchy) )) {
      return;
    }
    const $nodeSpan = $(node.span);
    // tslint:disable-next-line:max-line-length   // TODO:: (node.data.contentType === 'CourseUnit') check this condition
    const menuTemplate = node.data.root === true ? this.rootMenuTemplate : (node.data.root === false && node.folder === true  ? this.folderMenuTemplate : this.contentMenuTemplate);
    const iconsButton = $(menuTemplate);
    if ((node.getLevel() - 1) >= this.config.maxDepth) {
      iconsButton.find('#addchild').remove();
    }

    let contextMenu = $($nodeSpan[0]).find(`#contextMenu`);

    if (!contextMenu.length) {
      $nodeSpan.append(iconsButton);

      if (!activeNode) {
        iconsButton.hide();
      }

      $nodeSpan[0].onmouseover = () => {
        iconsButton.show();
      };

      $nodeSpan[0].onmouseout = () => {
        iconsButton.hide();
      };

      contextMenu = $($nodeSpan[0]).find(`#contextMenu`);

      contextMenu.on('click', (event) => {
        this.treeService.closePrevOpenedDropDown();
        setTimeout(() => {
          const nSpan = $(this.getActiveNode().span);

          const dropDownElement = $(nSpan[0]).find(`#contextMenuDropDown`);
          dropDownElement.removeClass('hidden');
          dropDownElement.addClass('visible');
          _.forEach(_.get(_.first(dropDownElement), 'children'), item => {
            item.addEventListener('click', (ev) => {
              this.treeService.closePrevOpenedDropDown();
              this.handleActionButtons(ev.currentTarget);
              ev.stopPropagation();
            });
          });
        }, 100);
        // event.stopPropagation();
      });

      $($nodeSpan[0]).find(`#removeNodeIcon`).on('click', (event: any) => {
        const isContent =  event.currentTarget.getAttribute('type') && event.currentTarget.getAttribute('type') === 'content';
        this.removeNode(isContent);
      });
    }

  }

  dropNode(targetNode, currentNode) {

    let dropAllowed;
    dropAllowed = true;
    // tslint:disable-next-line:max-line-length
    if (currentNode.otherNode.getLevel() === targetNode.getLevel() && currentNode.otherNode.folder === true &&  currentNode.hitMode !== 'over') {
      dropAllowed = true;
    // tslint:disable-next-line:max-line-length
    } else if (currentNode.otherNode.folder === true && (this.maxTreeDepth(currentNode.otherNode) + (targetNode.getLevel() - 1)) > _.get(this.config, 'maxDepth')) {
      return this.dropNotAllowed();
    } else if (currentNode.otherNode.folder === false && !this.checkContentAddition(targetNode, currentNode)) {
      dropAllowed = false;
    }

    if (dropAllowed) {
      const currentNodeDependency = this.editorService.getDependentNodes(currentNode.otherNode.data.id);
      if (!_.isEmpty(currentNodeDependency)) {
        this.moveDependentNodes(targetNode, currentNode);
      } else {
        currentNode.otherNode.moveTo(targetNode, currentNode.hitMode);
      }
      this.treeService.nextTreeStatus('reorder');
      return true;

    } else {
        this.toasterService.warning(`${currentNode.otherNode.title} cannot be added to ${currentNode.node.title}`);
        return false;
    }

  }

  dragDrop(node, data) {
    if ((data.hitMode === 'before' || data.hitMode === 'after' || data.hitMode === 'over') && data.node.data.root) {
      return this.dropNotAllowed();
    }
    if (_.has(this.config, 'maxDepth')) {
      return this.dropNode(node, data);
    }
  }

  dropNotAllowed() {
    this.toasterService.warning(_.get(this.configService, 'labelConfig.messages.error.007'));
    return false;
  }

  maxTreeDepth(root) {
    const buffer = [{ node: root, depth: 1 }];
    let current = buffer.pop();
    let max = 0;

    while (current && current.node) {
      // Find all children of this node.
      _.forEach(current.node.children, (child) => {
        buffer.push({ node: child, depth: current.depth + 1 });
      });
      if (current.depth > max) {
        max = current.depth;
      }
      current = buffer.pop();
    }
    return max;
  }

  checkContentAddition(targetNode, contentNode): boolean {
    if (targetNode.folder === false && (contentNode.hitMode === 'before' || contentNode.hitMode === 'after')) {
      return true;
    }
    if (targetNode.folder === false && contentNode.hitMode === 'over') {
      return false;
    }
    const nodeConfig = this.config.hierarchy[`level${targetNode.getLevel() - 1}`];
    const contentPrimaryCategories = _.flatMap(_.get(nodeConfig, 'children'));
    if (!_.isEmpty(contentPrimaryCategories)) {
      return _.includes(contentPrimaryCategories, _.get(contentNode, 'otherNode.data.metadata.primaryCategory')) ? true : false;
    }
    return false;
  }

  removeNode(isContent?: boolean) {
    this.treeEventEmitter.emit({ type: 'deleteNode', isContent });
    this.telemetryService.interact({ edata: this.getTelemetryInteractEdata('delete') });
  }

  handleActionButtons(el) {
    console.log('action buttons -------->', el.id);
    switch (el.id) {
      case 'edit':
        break;
      case 'delete':
        this.removeNode();
        break;
      case 'addsibling':
        this.addSibling();
        break;
      case 'addchild':
        this.addChild();
        break;
      case 'addresource':
        break;
    }
  }

  addFromLibrary() {
    this.editorService.emitshowLibraryPageEvent('showLibraryPage');
  }
  addQuestionFromLibrary() {
    this.editorService.emitshowQuestionLibraryPageEvent('showQuestionLibraryPage');
  }

  getTelemetryInteractEdata(id?) {
    return {
      id: id || 'collection-toc',
      type: 'click',
      subtype: 'launch',
      pageid: this.telemetryService.telemetryPageId,
      extra: {
        values: [_.get(this.getActiveNode(), 'data')]
      }
    };
  }

  createNewContent() {
    this.treeEventEmitter.emit({ type: 'createNewContent' });
  }

  moveDependentNodes(targetNode, currentNode) {
    const currentNodeDependency = this.editorService.getDependentNodes(currentNode.otherNode.data.id);
    const currentSectionId = _.get(currentNode, 'otherNode.parent.data.id');
    let movingNodeIds = [];
    if (!_.isEmpty(currentNodeDependency)) {
    // tslint:disable-next-line:max-line-length
    const nodeId =  _.get(currentNode, 'otherNode.data.id');
    if (!_.isEmpty(currentNodeDependency.target) || !_.isEmpty(currentNodeDependency.sourceTarget)) {
      if (currentNode.hitMode === 'after') {
        // tslint:disable-next-line:max-line-length
        movingNodeIds = _.uniq(_.compact(_.concat(currentNodeDependency.source, currentNodeDependency.target, currentNodeDependency.sourceTarget,nodeId)));
      }
      else {
        // tslint:disable-next-line:max-line-length
        movingNodeIds = _.uniq(_.compact(_.concat(currentNodeDependency.source, nodeId, currentNodeDependency.target, currentNodeDependency.sourceTarget)));
      }
      _.forEach(movingNodeIds, id => {
        const dependentNode = this.treeService.getNodeById(id);
        dependentNode.moveTo(targetNode, currentNode.hitMode);
      });
    }
    const isFolder: boolean = _.get(targetNode, 'folder');
    const targetNodeId = isFolder ? _.get(targetNode, 'data.id') : _.get(targetNode, 'parent.data.id');

    // tslint:disable-next-line:max-line-length
    this.rearrangeBranchingLogic(nodeId, currentSectionId, targetNodeId, currentNodeDependency, movingNodeIds);
   }
  }


  rearrangeBranchingLogic(nodeId, currentSectionId, targetSectionId, dependentNodeIDs, movingNodeIds) {
    const currentSectionBranchingLogic = this.editorService.getBranchingLogicByFolder(currentSectionId);
    const targetSectionBranchingLogic = this.editorService.getBranchingLogicByFolder(targetSectionId);
    const movingNodesBranchingEntry = _.pick(currentSectionBranchingLogic, movingNodeIds);
    const updateCurrentSectionBranchingLogic = _.omit(currentSectionBranchingLogic, movingNodeIds);
    const updateTargetSectionBranchingLogic = _.assign({}, targetSectionBranchingLogic, movingNodesBranchingEntry);
    const currentSectionName = _.get(this.treeService.getNodeById(currentSectionId), 'data.metadata.name');
    const targetSectionName = _.get(this.treeService.getNodeById(targetSectionId), 'data.metadata.name');
    this.updateTreeCache(currentSectionName, updateCurrentSectionBranchingLogic, currentSectionId);
    this.updateTreeCache(targetSectionName, updateTargetSectionBranchingLogic, targetSectionId);
  }

  updateTreeCache(name, branchingLogic, id, additionalMetadata?) {
    const primaryCategoryName = this.editorService.getPrimaryCategoryName(id);
    const metadata = {
      name,
      primaryCategory: primaryCategoryName,
      ...( !_.isUndefined(additionalMetadata) &&  {...additionalMetadata}),
      allowBranching: 'Yes',
      ...(!_.isUndefined(branchingLogic) && {branchingLogic})
    };
    this.treeService.updateTreeNodeMetadata(metadata, id, primaryCategoryName);
  }

  ngOnDestroy() {
    this.onComponentDestroy$.next();
    this.onComponentDestroy$.complete();
  }
}
