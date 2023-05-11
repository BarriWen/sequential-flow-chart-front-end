import { Dom } from '../core/dom';
import { Icons } from '../core/icons';
import { ToolboxGroupConfiguration } from '../designer-configuration';
import { DesignerContext } from '../designer-context';
import { ScrollBoxView } from './scrollbox-view';
import { ToolboxItem } from './toolbox-item';

export class ToolboxView {
	public static create(parent: HTMLElement, context: DesignerContext): ToolboxView {
		const root = Dom.element('div', {
			class: 'sqd-toolbox'
		});

		const header = Dom.element('div', {
			class: 'sqd-toolbox-header'
		});
		const headerTitle = Dom.element('div', {
			class: 'sqd-toolbox-header-title'
		});
		headerTitle.innerText = 'Toolbox';

		const headerToggleIcon = Icons.create('sqd-toolbox-toggle-icon');

		const body = Dom.element('div', {
			class: 'sqd-toolbox-body'
		});

		const filterInput = Dom.element('input', {
			class: 'sqd-toolbox-filter',
			type: 'text',
			placeholder: 'Search...'
		});

		//root.appendChild(header);
		root.appendChild(body);
		//header.appendChild(headerTitle);
		//header.appendChild(headerToggleIcon);
		//body.appendChild(filterInput);
		parent.appendChild(root);

		const scrollboxView1 = ScrollBoxView.create(body, parent);
		const scrollboxView2 = ScrollBoxView.create(body, parent);

		return new ToolboxView(header, headerToggleIcon, body, filterInput, scrollboxView1,scrollboxView2,context);
	}

	private constructor(
		private readonly header: HTMLElement,
		private readonly headerToggleIcon: SVGElement,
		private readonly body: HTMLElement,
		private readonly filterInput: HTMLInputElement,
		private readonly scrollboxView1: ScrollBoxView,
		private readonly scrollboxView2: ScrollBoxView,
		private readonly context: DesignerContext
	) {}

	public bindToggleIsCollapsedClick(handler: () => void) {
		function forward(e: Event) {
			e.preventDefault();
			handler();
		}
		this.header.addEventListener('click', forward, false);
	}

	public bindFilterInputChange(handler: (value: string) => void) {
		function forward(e: Event) {
			handler((e.target as HTMLInputElement).value);
		}
		this.filterInput.addEventListener('keyup', forward, false);
		this.filterInput.addEventListener('blur', forward, false);
	}

	public setIsCollapsed(isCollapsed: boolean) {
		Dom.toggleClass(this.body, isCollapsed, 'sqd-hidden');
		this.headerToggleIcon.innerHTML = isCollapsed ? Icons.arrowDown : Icons.close;
		if (!isCollapsed) {
			this.scrollboxView1.refresh();
			this.scrollboxView2.refresh();

		}
	}

	// public setGroups(groups: ToolboxGroupConfiguration[]) {
	// 	const list = Dom.element('div');

	// 	groups.forEach(group => {
	// 		const groupTitle = Dom.element('div', {
	// 			class: 'sqd-toolbox-group-title'
	// 		});
	// 		groupTitle.innerText = group.name;
	// 		list.appendChild(groupTitle);

	// 		group.steps.forEach(s => ToolboxItem.create(list, s, this.context));
	// 	});
	// 	this.scrollboxView1.setContent(list);
	// }

	public setGroups(groups: ToolboxGroupConfiguration[]) {
		const list1 = Dom.element('div');
		const list2 = Dom.element('div');
		

		//groups.forEach(group => {
		const groupTitle1 = Dom.element('div', {
			class: 'sqd-scrollbox-title-1'

			//class: 'sqd-toolbox-group-title'
		});
		groupTitle1.innerText = "Filter";

		const groupTitle2 = Dom.element('div', {
			class: 'sqd-scrollbox-title-2'

			//class: 'sqd-toolbox-group-title'
		});
		groupTitle1.innerText = "Filter";
		groupTitle2.innerText = "Action"
		list1.appendChild(groupTitle1);
		list2.appendChild(groupTitle2);

		//});
		groups[0].steps.forEach(s => ToolboxItem.create(list1, s, this.context));
		groups[1].steps.forEach(s => ToolboxItem.create(list2, s, this.context));

		this.scrollboxView1.setContent(list1);
		this.scrollboxView2.setContent(list2);
		
	}

	public destroy() {
		this.scrollboxView1.destroy();
		this.scrollboxView2.destroy();
	}
}
