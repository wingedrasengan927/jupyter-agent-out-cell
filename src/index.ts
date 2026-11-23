import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyter-agent-out-cell extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-agent-out-cell:plugin',
  description: 'A JupyterLab extension that adds metadata to a markdown cell to differentiate it from a regular markdown cell. It\'s use is in one of the bigger projects that provide an interface to interact with agents. This cell will be used to represent agent output',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter-agent-out-cell is activated!');
  }
};

export default plugin;
