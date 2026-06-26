"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockHostWidget_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockHostWidget = exports.BlockHost = void 0;
const React = __importStar(require("react"));
const inversify_1 = require("@theia/core/shared/inversify");
const react_widget_1 = require("@theia/core/lib/browser/widgets/react-widget");
const common_1 = require("../common");
function BlockHost({ blocks, registry = (0, common_1.createDefaultBlockRegistry)() }) {
    return (React.createElement("div", { className: "pratibimba-block-host", "data-test": "block-host" }, blocks.map(block => {
        const entry = registry.assertAccepted(block);
        const owner = registry.owner(block.type);
        return (React.createElement("article", { key: block.id, className: "pratibimba-block", "data-test": `block-host-block-${block.id}`, "data-block-type": block.type, "data-owner-extension": owner?.ownerExtensionId ?? '', "data-edit-surface": entry.editSurface, "data-privacy-class": block.privacyClass },
            React.createElement("header", { className: "pratibimba-block__header" },
                React.createElement("strong", null, block.type),
                block.coordinate && React.createElement("code", null, block.coordinate)),
            React.createElement("pre", { className: "pratibimba-block__data" }, JSON.stringify(block.data, null, 2))));
    })));
}
exports.BlockHost = BlockHost;
let BlockHostWidget = class BlockHostWidget extends react_widget_1.ReactWidget {
    constructor() {
        super(...arguments);
        this.blocks = [];
        this.registry = (0, common_1.createDefaultBlockRegistry)();
    }
    static { BlockHostWidget_1 = this; }
    static { this.ID = 'pratibimba.block-kit.host'; }
    static { this.LABEL = 'Block Host'; }
    init() {
        this.id = BlockHostWidget_1.ID;
        this.title.label = BlockHostWidget_1.LABEL;
        this.title.caption = 'Pratibimba block-kit host';
        this.title.closable = true;
        this.addClass('pratibimba-block-kit-host');
    }
    setBlocks(blocks) {
        this.blocks = Object.freeze([...blocks]);
        this.update();
    }
    render() {
        return React.createElement(BlockHost, { blocks: this.blocks, registry: this.registry });
    }
};
exports.BlockHostWidget = BlockHostWidget;
__decorate([
    (0, inversify_1.postConstruct)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlockHostWidget.prototype, "init", null);
exports.BlockHostWidget = BlockHostWidget = BlockHostWidget_1 = __decorate([
    (0, inversify_1.injectable)()
], BlockHostWidget);
//# sourceMappingURL=block-host.js.map