import Component from "./base-component";
import { DragTarget } from "../models/drag-and-drop";
import * as ProjectModel from "../models/project";
import { projectState } from "../state/project-state";
import ProjectItem from "./project-item";
import AutoBind from "../decorators/autobind";

// ProjectList class
export default class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: ProjectModel.Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: ProjectModel.Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectModel.ProjectStatus.Active;
        } else {
          return prj.status === ProjectModel.ProjectStatus.Finished;
        }
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;

    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    listEl.innerHTML = "";

    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
    }
  }

  @AutoBind
  dragOverHandler(event: DragEvent) {
    // allow dropping only plain text (no imgs etc.)
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  @AutoBind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData("text/plain");
    const projectStatus =
      this.type === "active"
        ? ProjectModel.ProjectStatus.Active
        : ProjectModel.ProjectStatus.Finished;

    projectState.moveProject(projectId, projectStatus);
  }
}
