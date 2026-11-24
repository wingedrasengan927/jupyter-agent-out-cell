import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Cell } from '@jupyterlab/cells';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

const PLUGIN_ID = 'jupyter-agent-out-cell:plugin';
const AGENT_OUT_METADATA_KEY = 'agent_out';
const AGENT_OUT_CELL_CLASS = 'jp-jupyter-agent-out-cell';

/**
 * Adds the agent output CSS class if the cell carries `{"agent_out": true}` metadata.
 *
 * @param cell - The notebook cell widget to check
 */
function styleAgentOutCell(cell: Cell): void {
  if (
    !cell.isDisposed &&
    cell.model.getMetadata(AGENT_OUT_METADATA_KEY) === true
  ) {
    cell.addClass(AGENT_OUT_CELL_CLASS);
  }
}

/**
 * Tracks a notebook panel to style initial and newly added `agent_out` cells.
 *
 * @param panel - The notebook panel widget to track
 */
function trackNotebookPanel(panel: NotebookPanel): void {
  void panel.context.ready
    .then(() => {
      if (panel.isDisposed) {
        return;
      }

      const notebook = panel.content;
      const model = notebook.model;
      if (!model) {
        return;
      }

      for (const cell of notebook.widgets) {
        styleAgentOutCell(cell);
      }

      const onCellsChanged: Parameters<
        typeof model.cells.changed.connect
      >[0] = (_list, change) => {
        if (change.type === 'add') {
          const cell = notebook.widgets[change.newIndex];
          if (cell) {
            styleAgentOutCell(cell);
          }
        }
      };

      model.cells.changed.connect(onCellsChanged);
      panel.disposed.connect(() => {
        model.cells.changed.disconnect(onCellsChanged);
      });
    })
    .catch((err: unknown) => {
      console.error(
        'Failed waiting for notebook context in jupyter-agent-out-cell:',
        err
      );
    });
}

/**
 * Initialization data for the jupyter-agent-out-cell extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description:
    "A JupyterLab extension that adds metadata to a markdown cell to differentiate it from a regular markdown cell. It's use is in one of the bigger projects that provide an interface to interact with agents. This cell will be used to represent agent output",
  autoStart: true,
  requires: [INotebookTracker],
  activate: (
    _app: JupyterFrontEnd,
    notebookTracker: INotebookTracker
  ): void => {
    // Fire for already open notebook tabs at startup
    notebookTracker.forEach(trackNotebookPanel);

    // Fire for newly opened notebook tabs going forward
    notebookTracker.widgetAdded.connect((_tracker, panel) => {
      trackNotebookPanel(panel);
    });
  }
};

export default plugin;
