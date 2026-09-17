import { ContainerModule } from '@theia/core/shared/inversify';
import { WidgetFactory } from '@theia/core/lib/browser';
import { BlockHostWidget } from './block-host';

export default new ContainerModule(bind => {
    bind(BlockHostWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: BlockHostWidget.ID,
        createWidget: () => ctx.container.get(BlockHostWidget)
    }));
});
