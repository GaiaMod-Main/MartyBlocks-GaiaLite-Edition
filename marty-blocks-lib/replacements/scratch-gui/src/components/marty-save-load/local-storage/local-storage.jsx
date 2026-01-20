/* eslint-disable no-warning-comments */
/* eslint-disable no-undef */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-no-literals */
/* eslint-disable require-jsdoc */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import VM from "scratch-vm";
import errorBoundaryHOC from "../../../lib/error-boundary-hoc.jsx";
import { activateTab, BLOCKS_TAB_INDEX } from "../../../reducers/editor-tab";
import Button from "../../../components/button/button.jsx";
import Input from "../../../components/forms/input.jsx";
import styles from "./local-storage.css";
import collectMetadata from "../../../lib/collect-metadata";
import { blobToBase64 } from "../../../lib/save-load-utils";
import { requestNewProject } from "../../../reducers/project-state";

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  saveFileNamePlaceholder: {
    id: "gui.saveLoad.saveFileNamePlaceholder",
    description: "Placeholder text for the save file name input",
    defaultMessage: "Type what you would like to name your new save file here..."
  },
  fileLoadError: {
    id: "gui.saveLoad.fileLoadError",
    description: "Error message shown when a file fails to load",
    defaultMessage: "Failed to load project."
  },
  projectLoaded: {
    id: "gui.saveLoad.projectLoaded",
    description: "Message shown when a project is successfully loaded",
    defaultMessage: "Project loaded successfully."
  },
  fileSaveError: {
    id: "gui.saveLoad.fileSaveError",
    description: "Error message shown when a file fails to save",
    defaultMessage: "Failed to save project."
  },
  projectSaved: {
    id: "gui.saveLoad.projectSaved",
    description: "Message shown when a project is successfully saved",
    defaultMessage: "Project saved successfully."
  },
  overwriteFile: {
    id: "gui.saveLoad.overwriteFile",
    description: "Confirmation message shown when overwriting an existing file",
    defaultMessage: "Are you sure you want to overwrite this file?"
  }
});

class SaveLoad extends React.Component {
  constructor(props) {
    super(props);
    this.state = { saveFileName: "", fileNames: [], isValidFileName: false };
    this.setSaveFileName = this.setSaveFileName.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getCurrentFiles();
  }

  async getCurrentFiles() {
    const savedScratchFiles = await mv2Interface.listSavedScratchFiles();
    const fileNames = savedScratchFiles
      .map((encodedFileName) => decodeURIComponent(encodedFileName))
      .filter((fileName) => fileName !== "__autosave");
    this.setState({ fileNames });
  }

  setSaveFileName(saveFileName) {
    const isValidFileName = saveFileName.length > 0 && saveFileName.length < 30;
    this.setState({ saveFileName, isValidFileName });
  }

  async saveFile(fileName) {
    const { fileNames } = this.state;
    const safeFileName = encodeURIComponent(fileName);
    if (fileNames.includes(safeFileName)) {
      if (
        !window.confirm(this.props.intl.formatMessage(messages.overwriteFile) + ` "${fileName}"?`)
      ) {
        return;
      }
    }
    const sb3Content = await this.props.saveProjectSb3();
    const base64sb3 = await blobToBase64(sb3Content);
    // eslint-disable-next-line no-undef
    try {
      await mv2Interface.saveScratchFile(safeFileName, base64sb3);
      alert(this.props.intl.formatMessage(messages.projectSaved));
      // TODO is this required?
      if (this.props.onProjectTelemetryEvent) {
        const metadata = collectMetadata(
          this.props.vm,
          this.props.projectTitle,
          this.props.locale
        );
        this.props.onProjectTelemetryEvent("projectDidSave", metadata);
      }
      const newFileNames = [
        fileName,
        ...fileNames.filter((fn) => fn !== fileName),
      ];
      this.setState({ fileNames: newFileNames });
    } catch (error) {
      alert(this.props.intl.formatMessage(messages.fileSaveError));
    }
  }

  async loadFile(fileName) {
    const { vm } = this.props;

    if (!vm.editingTarget) {
      return null;
    }
    try {
      const response = await mv2Interface.loadScratchFile(
        encodeURIComponent(fileName)
      );
      const blob = await fetch(response.contents);
      const arrayBuffer = await blob.arrayBuffer();
      vm.loadProject(arrayBuffer);
      setTimeout(() => {
        // give some time so all the buttons/devices are rendered before we start updating the UI
        window.raftManager.onProjectLoaded();
      }, 3000);
      alert(this.props.intl.formatMessage(messages.projectLoaded));
      // this seems to be required to let the wm load the project
      window.setTimeout(() => this.props.onActivateBlocksTab());
    } catch (error) {
      alert(this.props.intl.formatMessage(messages.fileLoadError));
    }
  }

  async deleteFile(fileName, getConfirmation = true) {
    const { fileNames } = this.state;
    // eslint-disable-next-line no-alert
    if (
      !getConfirmation ||
      window.confirm(`Are you sure you want to delete "${fileName}"?`)
    ) {
      try {
        await mv2Interface.deleteScratchFile(encodeURIComponent(fileName));
        const newFileNames = fileNames.filter((f) => f !== fileName);
        this.setState({ fileNames: newFileNames });
      } catch (error) {
        // eslint-disable-next-line no-alert
        alert(`Failed to delete project`);
      }
    }
  }

  render() {
    const { saveFileName, isValidFileName, fileNames } = this.state;
    return (
      <div className={styles.mainContent}>
        <div className={styles.block}>
          <div className={styles.saveHeaderContainer}>
            <div className={styles.newSaveTitleContainer}>
              <FormattedMessage
                id="gui.saveLoad.createNewSaveFile"
                description="Label for creating a new save file"
                defaultMessage="Create a new save file:"
              />
            </div>
            <Input
              placeholder={this.props.intl.formatMessage(messages.saveFileNamePlaceholder)}
              style={{ flex: 1, marginLeft: 10 }}
              type="text"
              value={saveFileName}
              onChange={(event) =>
                this.setSaveFileName(event.currentTarget.value)
              }
            />
            <Button
              style={{
                marginLeft: 10,
                marginRight: 5,
                opacity: isValidFileName ? 1 : 0.2,
              }}
              className={styles.button}
              disabled={!isValidFileName}
              onClick={() => this.saveFile(saveFileName)}
            >
              <FormattedMessage
                id="gui.saveLoad.saveFile"
                description="Button to save a file"
                defaultMessage="Save"
              />
            </Button>
          </div>
        </div>
        {fileNames.length > 0 && (
          <div
            className={[styles.block, styles["block-100"]].join(" ")}>
            <div className={styles.savedFilesContainer}>
              <div className={styles.savedFilesTitle}>
                <FormattedMessage
                  id="gui.saveLoad.savedFilesTitle"
                  description="Title for the saved files section"
                  defaultMessage="Your Saved Files:"
                />
              </div>
              <div className={styles.saveList}>
                {fileNames.sort().map((key, index) => (
                  <div
                    key={key}
                    className={styles.row}
                  >
                    <div style={{ flex: 2 }}>{key}</div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Button
                        className={styles.button}
                        style={{ marginLeft: 10 }}
                        onClick={() => this.deleteFile(key)}
                      >
                        <FormattedMessage
                          id="gui.saveLoad.deleteFile"
                          description="Button to delete a saved file"
                          defaultMessage="Delete"
                        />
                      </Button>
                      <Button
                        className={styles.button}
                        style={{ marginLeft: 10 }}
                        onClick={() => this.loadFile(key)}
                      >
                        <FormattedMessage
                          id="gui.saveLoad.loadFile"
                          description="Button to load a saved file"
                          defaultMessage="Load"
                        />
                      </Button>
                      <Button
                        className={styles.button}
                        style={{ marginLeft: 10 }}
                        onClick={() => this.saveFile(key)}
                      >
                        <FormattedMessage
                          id="gui.saveLoad.saveFile"
                          description="Button to save a file"
                          defaultMessage="Save"
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

SaveLoad.propTypes = {
  onActivateBlocksTab: PropTypes.func,
  saveProjectSb3: PropTypes.func,
  editingTarget: PropTypes.string,
  locale: PropTypes.string.isRequired,
  onProjectTelemetryEvent: PropTypes.func,
  projectTitle: PropTypes.string,
  vm: PropTypes.instanceOf(VM).isRequired,
  onConfirmNewProject: PropTypes.func,
};

const mapStateToProps = (state) => ({
  editingTarget: state.scratchGui.targets.editingTarget,
  locale: state.locales.locale,
  saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
});

const mapDispatchToProps = (dispatch) => ({
  onActivateBlocksTab: () => dispatch(activateTab(BLOCKS_TAB_INDEX)),
  onConfirmNewProject: () => dispatch(requestNewProject(false)),
});

export default errorBoundaryHOC("Save / Load")(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(SaveLoad))
);
