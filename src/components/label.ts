export interface LabelProps {
  label: string;
  value: number;
}

class Label {
  root: HTMLDivElement;
  labelElement: HTMLDivElement;
  valueElement: HTMLDivElement;

  constructor(
    private readonly container: HTMLElement,
    private props: LabelProps
  ) {
    this.root = document.createElement('div');
    this.root.className = 'label';
    this.container.appendChild(this.root);
    this.labelElement = document.createElement('div');
    this.root.appendChild(this.labelElement);
    this.valueElement = document.createElement('div');
    this.root.appendChild(this.valueElement);
    this.update(this.props);
  }

  update(props: Partial<LabelProps>) {
    this.props = { ...this.props, ...props };
    this.labelElement.textContent = this.props.label;
    this.valueElement.textContent = this.props.value.toString();
  }

  destroy() {
    this.container.removeChild(this.root);
  }
}

export default Label;
