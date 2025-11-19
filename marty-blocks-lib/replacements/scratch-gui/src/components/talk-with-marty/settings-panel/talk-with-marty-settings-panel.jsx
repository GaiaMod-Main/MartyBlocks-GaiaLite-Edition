import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import styles from '../talk-with-marty.css';

const messages = defineMessages({
    llmSettingsTitle: {id: 'talkWithMarty.llmSettingsTitle', defaultMessage: 'LLM Settings'},
    settingsOpenLabel: {id: 'talkWithMarty.settingsOpenLabel', defaultMessage: 'Open Settings'},
    settingsCloseLabel: {id: 'talkWithMarty.settingsCloseLabel', defaultMessage: 'Close Settings'},
    settingInstructions: {id: 'talkWithMarty.settingInstructions', defaultMessage: 'Instructions'},
    instructionsPlaceholder: {
        id: 'talkWithMarty.instructionsPlaceholder',
        defaultMessage: 'Guidance for how Marty should respond'
    },
    settingModel: {id: 'talkWithMarty.settingModel', defaultMessage: 'Model'},
    settingCodeFrame: {id: 'talkWithMarty.settingCodeFrame', defaultMessage: 'Code Frame'},
    codeFrameDescription: {
        id: 'talkWithMarty.codeFrameDescription',
        defaultMessage: 'Use the guardrails defined in the Python frame engine. Turn off to send an empty frame to the LLM.'
    },
    settingSafeguards: {id: 'talkWithMarty.settingSafeguards', defaultMessage: 'Safeguards'},
    safeguardsPlaceholder: {
        id: 'talkWithMarty.safeguardsPlaceholder',
        defaultMessage: 'Safety rules or restricted topics'
    }
});

class TalkWithMartySettingsPanel extends React.Component {
    constructor(props) {
        super(props);

        this.handleInstructionsChange = this.handleInstructionsChange.bind(this);
        this.handleSafeguardsChange = this.handleSafeguardsChange.bind(this);
        this.handleModelChange = this.handleModelChange.bind(this);
        this.handleUseCodeFrameChange = this.handleUseCodeFrameChange.bind(this);
    }

    handleInstructionsChange(event) {
        this.props.onSettingChange('instructions', event.target.value);
    }

    handleSafeguardsChange(event) {
        this.props.onSettingChange('safeguards', event.target.value);
    }

    handleModelChange(event) {
        this.props.onSettingChange('model', event.target.value);
    }

    handleUseCodeFrameChange(event) {
        this.props.onSettingChange('useCodeFrame', event.target.checked);
    }


    renderSettingsForm() {
        const {intl, settings, availableModels} = this.props;
        const options = Array.isArray(availableModels) ? availableModels : [];
        const modelValue = options.includes(settings.model) ? settings.model : (options[0] || '');
        const useCodeFrame = settings.useCodeFrame !== false;
        const codeFrameToggleId = 'talk-with-marty-code-frame-toggle';

        return (
            <form
                className={styles.settingsGrid}
                onSubmit={event => event.preventDefault()}
            >
                <label className={classNames(styles.inputGroup, styles.fullWidth)}>
                    <span className={styles.inputLabel}>
                        {intl.formatMessage(messages.settingModel)}
                    </span>
                    <select
                        className={styles.selectInput}
                        value={modelValue}
                        onChange={this.handleModelChange}
                    >
                        {options.map(model => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </label>
                <div className={classNames(styles.inputGroup, styles.fullWidth)}>
                    <span className={styles.inputLabel}>
                        {intl.formatMessage(messages.settingCodeFrame)}
                    </span>
                    <div className={styles.toggleRow}>
                        <input
                            id={codeFrameToggleId}
                            type="checkbox"
                            className={styles.toggleInput}
                            checked={useCodeFrame}
                            onChange={this.handleUseCodeFrameChange}
                        />
                        <label
                            htmlFor={codeFrameToggleId}
                            className={styles.toggleDescription}
                        >
                            {intl.formatMessage(messages.codeFrameDescription)}
                        </label>
                    </div>
                </div>
                <label className={classNames(styles.inputGroup, styles.fullWidth)}>
                    <span className={styles.inputLabel}>
                        {intl.formatMessage(messages.settingInstructions)}
                    </span>
                    <textarea
                        className={styles.textareaInput}
                        value={settings.instructions}
                        onChange={this.handleInstructionsChange}
                        placeholder={intl.formatMessage(messages.instructionsPlaceholder)}
                        rows={3}
                    />
                </label>
                <label className={classNames(styles.inputGroup, styles.fullWidth)}>
                    <span className={styles.inputLabel}>
                        {intl.formatMessage(messages.settingSafeguards)}
                    </span>
                    <textarea
                        className={styles.textareaInput}
                        value={settings.safeguards}
                        onChange={this.handleSafeguardsChange}
                        placeholder={intl.formatMessage(messages.safeguardsPlaceholder)}
                        rows={3}
                    />
                </label>
            </form>
        );
    }

    render() {
        const {intl, isOpen, onToggle} = this.props;

        return (
            <section
                className={classNames(styles.section, styles.settingsSection, {
                    [styles.settingsSectionOpen]: isOpen
                })}
            >
                <button
                    type="button"
                    className={styles.settingsToggle}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    onClick={onToggle}
                >
                    <span className={styles.settingsToggleLabel}>
                        {intl.formatMessage(messages.llmSettingsTitle)}
                    </span>
                    <span
                        className={classNames(styles.settingsToggleChevron, {
                            [styles.settingsToggleChevronOpen]: isOpen
                        })}
                        aria-hidden="true"
                    />
                    <span className={styles.visuallyHidden}>
                        {intl.formatMessage(
                            isOpen ? messages.settingsCloseLabel : messages.settingsOpenLabel
                        )}
                    </span>
                </button>
                {isOpen && (
                    <div className={styles.settingsContent}>
                        {this.renderSettingsForm()}
                    </div>
                )}
            </section>
        );
    }
}

TalkWithMartySettingsPanel.propTypes = {
    intl: intlShape,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    settings: PropTypes.shape({
        instructions: PropTypes.string,
        safeguards: PropTypes.string,
        model: PropTypes.string,
        useCodeFrame: PropTypes.bool
    }),
    availableModels: PropTypes.arrayOf(PropTypes.string),
    onSettingChange: PropTypes.func,
    users: PropTypes.arrayOf(PropTypes.string),
    onAddUser: PropTypes.func,
    onRemoveUser: PropTypes.func,
    onUpdateUser: PropTypes.func
};

TalkWithMartySettingsPanel.defaultProps = {
    settings: {
        instructions: '',
        safeguards: '',
        model: '',
        useCodeFrame: true
    },
    users: [],
    availableModels: []
};

export default injectIntl(TalkWithMartySettingsPanel);
