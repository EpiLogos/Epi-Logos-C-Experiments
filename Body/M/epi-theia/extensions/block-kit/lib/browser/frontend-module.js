"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("@theia/core/shared/inversify");
const browser_1 = require("@theia/core/lib/browser");
const block_host_1 = require("./block-host");
exports.default = new inversify_1.ContainerModule(bind => {
    bind(block_host_1.BlockHostWidget).toSelf();
    bind(browser_1.WidgetFactory).toDynamicValue(ctx => ({
        id: block_host_1.BlockHostWidget.ID,
        createWidget: () => ctx.container.get(block_host_1.BlockHostWidget)
    }));
});
//# sourceMappingURL=frontend-module.js.map