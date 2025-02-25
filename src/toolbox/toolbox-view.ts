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

		// root.appendChild(header);
		root.appendChild(body);
		// header.appendChild(headerTitle);
		// header.appendChild(headerToggleIcon);
		// body.appendChild(filterInput);
		parent.appendChild(root);

		const scrollboxView = ScrollBoxView.create(body, parent);
		return new ToolboxView(header, headerToggleIcon, body, filterInput, scrollboxView, context);
	}

	private constructor(
		private readonly header: HTMLElement,
		private readonly headerToggleIcon: SVGElement,
		private readonly body: HTMLElement,
		private readonly filterInput: HTMLInputElement,
		private readonly scrollboxView: ScrollBoxView,
		private readonly context: DesignerContext
	) { }

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
			this.scrollboxView.refresh();
		}
	}

	public setGroups(groups: ToolboxGroupConfiguration[]) {
		const listFilter = Dom.element('div');
		const groupTitleFilter = Dom.element('div', {
			class: 'sqd-toolbox-filter-title'
		});
		groupTitleFilter.innerText = groups[0].name;
		listFilter.appendChild(groupTitleFilter);
		groups[0].steps.forEach(s => ToolboxItem.create(listFilter, s, this.context));
		listFilter.setAttribute("class", "group-filter"); 
		this.scrollboxView.setContent(listFilter);

		const listAction = Dom.element('div'); 
		const groupTitleAction = Dom.element('div', {
			class: 'sqd-toolbox-action-title'
		});
		groupTitleAction.innerText = groups[1].name;
		listAction.appendChild(groupTitleAction);
		groups[1].steps.forEach(s => ToolboxItem.create(listAction, s, this.context));
		listAction.setAttribute("class", "group-action"); 
		this.scrollboxView.setContent(listAction);
	}

	public destroy() {
		this.scrollboxView.destroy();
	}
}
