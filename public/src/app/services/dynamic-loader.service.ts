import {
  ComponentFactoryResolver,
  Injectable,
  Inject,
  ReflectiveInjector
} from '@angular/core'
import { ProfileCardComponent } from '../profile-card/profile-card.component'

@Injectable({
  providedIn: 'root'
})
export class DynamicLoaderService {
  factoryResolver
  rootViewContainer

  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    this.factoryResolver = factoryResolver
  }
  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef
  }
  addDynamicComponent() {
    const factory = this.factoryResolver
                        .resolveComponentFactory(ProfileCardComponent)
    const component = factory
      .create(this.rootViewContainer.parentInjector)
    this.rootViewContainer.insert(component.hostView)
  }
}
