export interface ButtonProps {
  label: string;
  className: string;
  onClick: () => void;
}

class Button {
  private readonly element: HTMLButtonElement;

  constructor(
    private readonly container: HTMLElement,
    private readonly props: ButtonProps
  ) {
    this.element = document.createElement('button');
    this.element.textContent = props.label;
    this.handleClick = this.props.onClick;
    this.element.className = props.className;
    this.container.appendChild(this.element);
    this.element.addEventListener('click', this.handleClick);
  }

  private readonly handleClick = () => {
    this.props.onClick();
  };

  destroy() {
    this.element.removeEventListener('click', this.handleClick);
    this.element.remove();
  }
}

export default Button;
