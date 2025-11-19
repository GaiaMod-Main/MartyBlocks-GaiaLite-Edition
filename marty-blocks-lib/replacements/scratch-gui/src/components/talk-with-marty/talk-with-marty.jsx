import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import LoadingSpinnerMarty from './marty-is-thinking-svg.jsx';
import SpeakingMarty from './marty-is-speaking-svg.jsx';
import TalkWithMartySettingsPanel from './settings-panel/talk-with-marty-settings-panel.jsx';
import RecordingPreparationProgress from './recording-preparation-progress.jsx';
import styles from './talk-with-marty.css';
import {
    ensureLLMSettingsHydrated,
    getLLMSettings,
    getLLMSettingsSource,
    getServerLLMSettings,
    setServerLLMSettingsSnapshot,
    subscribeToLLMSettings,
    subscribeToLLMSettingsSource,
    subscribeToServerLLMSettings
} from '../../lib/llm-settings.js';
import { fetchLLMSettingsFromServer } from '../../lib/llm-settings-service.js';

const serverUrl = 'https://eth-server.appv2-analytics-server.robotical.io';
// const serverUrl = 'http://localhost:4444';

const messages = defineMessages({
    interactionTypeTitle: {
        id: 'talkWithMarty.interactionTypeTitle',
        defaultMessage: 'Interaction Type'
    },
    conversationModeConversation: {
        id: 'talkWithMarty.conversationModeConversation',
        defaultMessage: 'Conversation'
    },
    conversationModeConversationDescription: {
        id: 'talkWithMarty.conversationModeConversationDescription',
        defaultMessage: 'Marty keeps context for multi-turn conversations.'
    },
    conversationModeQA: {
        id: 'talkWithMarty.conversationModeQa',
        defaultMessage: 'Q&A'
    },
    conversationModeQADescription: {
        id: 'talkWithMarty.conversationModeQaDescription',
        defaultMessage: 'Single question and response — no memory between turns.'
    },
    interactionParametersTitle: {
        id: 'talkWithMarty.interactionParametersTitle',
        defaultMessage: 'Interaction Parameters'
    },
    interactionModePushToTalk: {
        id: 'talkWithMarty.interactionModePushToTalk',
        defaultMessage: 'Push-to-Talk'
    },
    interactionModePushToTalkDescription: {
        id: 'talkWithMarty.interactionModePushToTalkDescription',
        defaultMessage: 'Choose the key each user will press to talk. Hold the key while speaking.'
    },
    interactionModeWakeWords: {
        id: 'talkWithMarty.interactionModeWakeWords',
        defaultMessage: 'Wake Words'
    },
    interactionModeWakeWordsDescription: {
        id: 'talkWithMarty.interactionModeWakeWordsDescription',
        defaultMessage: 'Say "Hey Marty" to start and "I am done" to finish.'
    },
    listeningStart: {
        id: 'talkWithMarty.listeningStart',
        defaultMessage: 'Start Listening'
    },
    listeningStop: {
        id: 'talkWithMarty.listeningStop',
        defaultMessage: 'Stop Listening'
    },
    wakeWordHint: {
        id: 'talkWithMarty.wakeWordHint',
        defaultMessage: 'Marty will automatically listen for "Hey Marty" and pause when you say "I am done".'
    },
    transcriptTitle: {
        id: 'talkWithMarty.transcriptTitle',
        defaultMessage: 'Transcript'
    },
    transcriptEmpty: {
        id: 'talkWithMarty.transcriptEmpty',
        defaultMessage: 'No messages yet. Start the conversation to see it here.'
    },
    transcriptDownload: {
        id: 'talkWithMarty.transcriptDownload',
        defaultMessage: 'Download Transcript'
    },
    transcriptClear: {
        id: 'talkWithMarty.transcriptClear',
        defaultMessage: 'Clear Transcript'
    },
    sendMessageLabel: {
        id: 'talkWithMarty.sendMessageLabel',
        defaultMessage: 'Message'
    },
    sendMessagePlaceholder: {
        id: 'talkWithMarty.sendMessagePlaceholder',
        defaultMessage: 'Type what you would like to say to Marty...'
    },
    sendMessageButton: {
        id: 'talkWithMarty.sendMessageButton',
        defaultMessage: 'Send'
    },
    llmSettingsTitle: {
        id: 'talkWithMarty.llmSettingsTitle',
        defaultMessage: 'LLM Settings'
    },
    settingSafeguards: {
        id: 'talkWithMarty.settingSafeguards',
        defaultMessage: 'Safeguards'
    },
    safeguardsPlaceholder: {
        id: 'talkWithMarty.safeguardsPlaceholder',
        defaultMessage: 'Safety rules or restricted topics'
    },
    settingInstructions: {
        id: 'talkWithMarty.settingInstructions',
        defaultMessage: 'Instructions'
    },
    instructionsPlaceholder: {
        id: 'talkWithMarty.instructionsPlaceholder',
        defaultMessage: 'Guidance for how Marty should respond'
    },
    transcriptLabelUser: {
        id: 'talkWithMarty.transcriptLabelUser',
        defaultMessage: 'You'
    },
    transcriptLabelMarty: {
        id: 'talkWithMarty.transcriptLabelMarty',
        defaultMessage: 'Marty'
    },
    recordingIndicator: {
        id: 'talkWithMarty.recordingIndicator',
        defaultMessage: 'Recording…'
    },
    recordingUnsupported: {
        id: 'talkWithMarty.recordingUnsupported',
        defaultMessage: 'Audio recording is not supported in this browser.'
    },
    recordingPermissionDenied: {
        id: 'talkWithMarty.recordingPermissionDenied',
        defaultMessage: 'Microphone permission was denied. Please enable access to continue.'
    },
    recordingDeviceNotFound: {
        id: 'talkWithMarty.recordingDeviceNotFound',
        defaultMessage: 'No microphone was found. Connect a mic and try again.'
    },
    recordingGenericError: {
        id: 'talkWithMarty.recordingGenericError',
        defaultMessage: 'Something went wrong while recording audio. Try pressing the key longer.'
    },
    lastRecordingLabel: {
        id: 'talkWithMarty.lastRecordingLabel',
        defaultMessage: 'Last recording'
    },
    processingRecording: {
        id: 'talkWithMarty.processingRecording',
        defaultMessage: 'Processing recording…'
    },
    speechRequestFailed: {
        id: 'talkWithMarty.speechRequestFailed',
        defaultMessage: 'Could not process the recording. Try pressing the key longer.'
    },
    textRequestFailed: {
        id: 'talkWithMarty.textRequestFailed',
        defaultMessage: 'Could not send message. Please try again.'
    },
    thinkingIndicator: {
        id: 'talkWithMarty.thinkingIndicator',
        defaultMessage: 'Thinking…'
    },
    speakingIndicator: {
        id: 'talkWithMarty.speakingIndicator',
        defaultMessage: 'Speaking…'
    },
    activityOverlayLabel: {
        id: 'talkWithMarty.activityOverlayLabel',
        defaultMessage: 'Marty is responding'
    },
    currentSpeakerLabel: {
        id: 'talkWithMarty.currentSpeakerLabel',
        defaultMessage: 'Current Speaker'
    },
    usersSettingsTitle: {
        id: 'talkWithMarty.usersSettingsTitle',
        defaultMessage: 'Participants'
    },
    usersSettingsDescription: {
        id: 'talkWithMarty.usersSettingsDescription',
        defaultMessage: 'Key'
    },
    addUserPlaceholder: {
        id: 'talkWithMarty.addUserPlaceholder',
        defaultMessage: 'New participant name'
    },
    addUserButton: {
        id: 'talkWithMarty.addUserButton',
        defaultMessage: 'Add'
    },
    removeUserButton: {
        id: 'talkWithMarty.removeUserButton',
        defaultMessage: 'Remove'
    },
    addUserHint: {
        id: 'talkWithMarty.addUserHint',
        defaultMessage: 'Press Enter or click Add to save the participant.'
    },
    recordingPreparingIndicator: {
        id: 'talkWithMarty.recordingPreparingIndicator',
        defaultMessage: 'Preparing to record…'
    },
    recordingStartCue: {
        id: 'talkWithMarty.recordingStartCue',
        defaultMessage: "Start speaking after the progress bar completes and see the recording indicator."
    },
});

const AVAILABLE_USER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const DEFAULT_USER_KEY = AVAILABLE_USER_KEYS[0];
const PREPARING_PROGRESS_DURATION_MS = 1000;
const AVAILABLE_LLM_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-5', 'gpt-5-mini', 'gpt-5-chat', 'gemini-2.5-flash-lite'];
const DEFAULT_LLM_MODEL = 'gpt-5';
const FRAME_ENGINE_PROVIDER = 'frame-engine';
const LLM_MODEL_METADATA = {
    'gpt-4o-mini': { provider: 'openai' },
    'gpt-4o': { provider: 'openai' },
    'gpt-5': { provider: 'openai' },
    'gpt-5-mini': { provider: 'openai' },
    'gpt-5-chat': { provider: 'openai' },
    'gemini-2.5-flash-lite': { provider: 'gemini' }
};

// Added: storage key
const SESSION_STORAGE_KEY = 'talkWithMartyState';
const LEGACY_TRANSCRIPT_STORAGE_KEY = 'talkWithMartyTranscript';

const extractTeacherLLMSettings = rawSettings => {
    const source = rawSettings && typeof rawSettings === 'object' ? rawSettings : {};
    const legacySafeguards = typeof source.safeguards === 'string'
        ? source.safeguards
        : source.safeguards && typeof source.safeguards === 'object'
            ? source.safeguards.notes || ''
            : '';
    return {
        importantInstructions: source.importantInstructions || source.instructions || '',
        importantSafeguards: source.importantSafeguards || legacySafeguards,
        knowledgeBase: source.knowledgeBase || ''
    };
};

class TalkWithMarty extends React.Component {
    constructor(props) {
        super(props);

        const teacherLLMSettings = extractTeacherLLMSettings(getLLMSettings());
        const serverLLMSettings = extractTeacherLLMSettings(getServerLLMSettings());
        const llmSettingsSource = getLLMSettingsSource();

        this.state = {
            conversationMode: 'conversation',
            interactionMode: 'pushToTalk',
            isListening: false,
            transcript: [],
            currentMessage: '',
            llmSettings: {
                safeguards: '',
                instructions: '',
                model: DEFAULT_LLM_MODEL,
                useCodeFrame: true
            },
            isMicLoading: false,
            recordingError: null,
            lastRecordingUrl: '',
            isProcessingAudio: false,
            isSendingText: false,
            messageError: null,
            isThinking: false,
            isSpeaking: false,
            isSettingsOpen: false,
            users: [{ name: 'You', key: DEFAULT_USER_KEY }],
            currentUser: 'You',
            newUserName: '',
            newUserKey: AVAILABLE_USER_KEYS.find(key => key !== DEFAULT_USER_KEY) || '',
            editingUser: {},
            recordingStatus: 'idle',
            activeTextJobId: null,
            activeTextJobStatus: null
        };
        this.handleConversationModeChange = this.handleConversationModeChange.bind(this);
        this.handleInteractionModeChange = this.handleInteractionModeChange.bind(this);
        this.handleToggleListening = this.handleToggleListening.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleDownloadTranscript = this.handleDownloadTranscript.bind(this);
        this.handleSettingsChange = this.handleSettingsChange.bind(this);
        this.handleClearTranscript = this.handleClearTranscript.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.ensureMediaStream = this.ensureMediaStream.bind(this);
        this.handleAudioChunk = this.handleAudioChunk.bind(this);
        this.handleRecorderStop = this.handleRecorderStop.bind(this);
        this.handleRecordingError = this.handleRecordingError.bind(this);
        this.disposeMedia = this.disposeMedia.bind(this);
        this.processRecording = this.processRecording.bind(this);
        this.buildWhisperFormData = this.buildWhisperFormData.bind(this);
        this.getExtensionFromMime = this.getExtensionFromMime.bind(this);
        this.buildConversationHistory = this.buildConversationHistory.bind(this);
        this.buildLLMSettingsForRequest = this.buildLLMSettingsForRequest.bind(this);
        this.shouldIncludeSpeech = this.shouldIncludeSpeech.bind(this);
        this.buildSpeechRequestPayload = this.buildSpeechRequestPayload.bind(this);
        this.sendSpeechRequest = this.sendSpeechRequest.bind(this);
        this.applySpeechResponse = this.applySpeechResponse.bind(this);
        this.createTranscriptEntry = this.createTranscriptEntry.bind(this);
        this.appendTranscriptEntries = this.appendTranscriptEntries.bind(this);
        this.removeTranscriptEntry = this.removeTranscriptEntry.bind(this);
        this.buildTextRequestPayload = this.buildTextRequestPayload.bind(this);
        this.sendTextRequest = this.sendTextRequest.bind(this);
        this.handleSpeechAudioResult = this.handleSpeechAudioResult.bind(this);
        this.postJson = this.postJson.bind(this);
        this.ensureAbsoluteServerUrl = this.ensureAbsoluteServerUrl.bind(this);
        this.normalizeTalkWithMartyPayload = this.normalizeTalkWithMartyPayload.bind(this);
        this.upsertMartyTranscriptEntry = this.upsertMartyTranscriptEntry.bind(this);
        this.handleTextJobUpdate = this.handleTextJobUpdate.bind(this);
        this.waitForTextJobCompletion = this.waitForTextJobCompletion.bind(this);
        this.streamTextJobUpdates = this.streamTextJobUpdates.bind(this);
        this.pollTextJobStatus = this.pollTextJobStatus.bind(this);
        this.delay = this.delay.bind(this);
        this.resetActiveTextJobResources = this.resetActiveTextJobResources.bind(this);
        this.safeParseEventData = this.safeParseEventData.bind(this);
        this.resolveNormalizedPayload = this.resolveNormalizedPayload.bind(this);
        this.isPayloadComplete = this.isPayloadComplete.bind(this);
        this.toggleSettingsPanel = this.toggleSettingsPanel.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleRemoveUser = this.handleRemoveUser.bind(this);
        this.handleUpdateUser = this.handleUpdateUser.bind(this);
        this.handleUpdateUserKey = this.handleUpdateUserKey.bind(this);
        this.handleSetCurrentUser = this.handleSetCurrentUser.bind(this);
        this.handleEditUser = this.handleEditUser.bind(this);
        this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
        this.handleGlobalKeyUp = this.handleGlobalKeyUp.bind(this);
        this.handleWindowBlur = this.handleWindowBlur.bind(this);
        this.playRecordingPreview = this.playRecordingPreview.bind(this);

        this.mediaStream = null;
        this.mediaRecorder = null;
        this.lastRecordingAudio = null;
        this.audioChunks = [];
        this.isComponentMounted = false;
        this.mediaSupportAvailable = typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';
        this.martySpeechUrl = '';
        this.activeUserKey = null;
        this.unsubscribeFromLLMSettings = null;
        this.unsubscribeFromServerLLMSettings = null;
        this.unsubscribeFromLLMSettingsSource = null;
        this.teacherLLMSettings = teacherLLMSettings;
        this.serverTeacherLLMSettings = serverLLMSettings;
        this.llmSettingsSource = llmSettingsSource;
        this.activeTextJob = null;
        this.activeTextJobEventSource = null;
        this.activeTextJobAbortController = null;
        this.activeTextJobDelayTimeout = null;
        this.activeTextJobLastPayload = null;
        this.transcriptContainerRef = React.createRef();
    }

    componentDidMount() {
        this.isComponentMounted = true;
        this.unsubscribeFromLLMSettings = subscribeToLLMSettings(nextSettings => {
            this.teacherLLMSettings = extractTeacherLLMSettings(nextSettings);
        });
        this.unsubscribeFromServerLLMSettings = subscribeToServerLLMSettings(nextSettings => {
            this.serverTeacherLLMSettings = extractTeacherLLMSettings(nextSettings);
        });
        this.unsubscribeFromLLMSettingsSource = subscribeToLLMSettingsSource(nextSource => {
            if (nextSource === 'local' || nextSource === 'server') {
                this.llmSettingsSource = nextSource;
            }
        });
        ensureLLMSettingsHydrated().catch(error => {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Failed to hydrate LLM settings', error);
        });
        fetchLLMSettingsFromServer()
            .then(remoteSettings => {
                setServerLLMSettingsSnapshot(remoteSettings);
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.warn('[TalkWithMarty] Failed to refresh server LLM settings', error);
            });
        // Load persisted session (if any)
        this.loadSessionFromStorage();
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleGlobalKeyDown);
            window.addEventListener('keyup', this.handleGlobalKeyUp);
            window.addEventListener('blur', this.handleWindowBlur);
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
        this.disposeMedia();
        if (this.state.lastRecordingUrl) {
            const urlCreator = window.URL || window.webkitURL;
            if (urlCreator) {
                urlCreator.revokeObjectURL(this.state.lastRecordingUrl);
            }
        }
        if (this.martySpeechUrl) {
            const urlCreator = window.URL || window.webkitURL;
            if (urlCreator) {
                urlCreator.revokeObjectURL(this.martySpeechUrl);
            }
            this.martySpeechUrl = '';
        }
        if (this.lastRecordingAudio) {
            try {
                this.lastRecordingAudio.pause();
                this.lastRecordingAudio.src = '';
            } catch (_) {
                // ignore cleanup issues
            }
            this.lastRecordingAudio = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleGlobalKeyDown);
            window.removeEventListener('keyup', this.handleGlobalKeyUp);
            window.removeEventListener('blur', this.handleWindowBlur);
        }
        this.resetActiveTextJobResources({ resetState: true });
        if (this.unsubscribeFromLLMSettings) {
            this.unsubscribeFromLLMSettings();
            this.unsubscribeFromLLMSettings = null;
        }
        if (this.unsubscribeFromServerLLMSettings) {
            this.unsubscribeFromServerLLMSettings();
            this.unsubscribeFromServerLLMSettings = null;
        }
        if (this.unsubscribeFromLLMSettingsSource) {
            this.unsubscribeFromLLMSettingsSource();
            this.unsubscribeFromLLMSettingsSource = null;
        }
    }

    // Added: persist helpers
    loadSessionFromStorage() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
            const updates = {};

            if (storedSession) {
                const parsed = JSON.parse(storedSession);
                if (parsed && typeof parsed === 'object') {
                    const sanitizedUsers = this.sanitizeStoredUsers(parsed.users);
                    if (sanitizedUsers.length) {
                        updates.users = sanitizedUsers;
                    }
                    if (Array.isArray(parsed.transcript)) {
                        updates.transcript = parsed.transcript;
                    }
                    if (parsed.llmSettings && typeof parsed.llmSettings === 'object') {
                    const {
                        prompt: _ignoredPrompt,
                        instructions,
                        safeguards,
                        model,
                        useCodeFrame
                    } = parsed.llmSettings;
                    const rawModel = typeof model === 'string' ? model : '';
                    const sanitizedModel = AVAILABLE_LLM_MODELS.includes(rawModel)
                        ? rawModel
                        : (this.state.llmSettings.model || DEFAULT_LLM_MODEL);
                    const storedUseCodeFrame = typeof useCodeFrame === 'boolean'
                        ? useCodeFrame
                        : (typeof this.state.llmSettings.useCodeFrame === 'boolean'
                            ? this.state.llmSettings.useCodeFrame
                            : true);
                    updates.llmSettings = {
                        instructions: typeof instructions === 'string' ? instructions : this.state.llmSettings.instructions,
                        safeguards: typeof safeguards === 'string' ? safeguards : this.state.llmSettings.safeguards,
                        model: sanitizedModel,
                        useCodeFrame: storedUseCodeFrame
                    };
                }
                    const storedCurrentUser = typeof parsed.currentUser === 'string' ? parsed.currentUser : null;
                    if (storedCurrentUser && sanitizedUsers.some(user => user.name === storedCurrentUser)) {
                        updates.currentUser = storedCurrentUser;
                    } else if (updates.users && updates.users.length) {
                        updates.currentUser = updates.users[0].name;
                    }
                }
            } else {
                const legacyTranscript = window.localStorage.getItem(LEGACY_TRANSCRIPT_STORAGE_KEY);
                if (legacyTranscript) {
                    const parsedTranscript = JSON.parse(legacyTranscript);
                    if (Array.isArray(parsedTranscript)) {
                        updates.transcript = parsedTranscript;
                    }
                }
            }

            if (Object.keys(updates).length) {
                const usersForKey = updates.users || this.state.users;
                const nextNewKey = this.getNextAvailableKey(usersForKey);
                this.setState({
                    ...updates,
                    newUserName: '',
                    newUserKey: nextNewKey || ''
                });
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Failed to load stored session', e);
        }
    }

    saveSessionToStorage() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            const { llmSettings } = this.state;
            const persistedUseCodeFrame = typeof llmSettings?.useCodeFrame === 'boolean'
                ? llmSettings.useCodeFrame
                : true;
            const payload = {
                transcript: this.state.transcript,
                users: this.state.users,
                currentUser: this.state.currentUser,
                llmSettings: {
                    instructions: (llmSettings && llmSettings.instructions) || '',
                    safeguards: (llmSettings && llmSettings.safeguards) || '',
                    model: llmSettings && AVAILABLE_LLM_MODELS.includes(llmSettings.model)
                        ? llmSettings.model
                        : DEFAULT_LLM_MODEL,
                    useCodeFrame: persistedUseCodeFrame
                }
            };
            window.localStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(payload)
            );
            try {
                window.localStorage.removeItem(LEGACY_TRANSCRIPT_STORAGE_KEY);
            } catch (_) { }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Failed to save session', e);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const didChangeSession =
            prevState.transcript !== this.state.transcript ||
            prevState.users !== this.state.users ||
            prevState.currentUser !== this.state.currentUser ||
            prevState.llmSettings !== this.state.llmSettings;

        if (didChangeSession) {
            this.saveSessionToStorage();
        }

        if (prevState.users !== this.state.users) {
            const availableKeys = this.getAvailableKeys();
            if (this.state.newUserKey && !availableKeys.includes(this.state.newUserKey)) {
                this.setState({ newUserKey: availableKeys[0] || '' });
            } else if (!this.state.newUserKey && availableKeys.length) {
                this.setState({ newUserKey: availableKeys[0] });
            }
        }

        if (this.state.transcript.length > prevState.transcript.length) {
            this.scrollTranscriptToBottom();
        }
    }

    scrollTranscriptToBottom(options = {}) {
        if (!this.transcriptContainerRef || !this.transcriptContainerRef.current) {
            return;
        }

        const { behavior = 'smooth' } = options;
        const container = this.transcriptContainerRef.current;
        const scrollBehavior = behavior === 'smooth' ? 'smooth' : 'auto';

        const applyScroll = () => {
            if (typeof container.scrollTo === 'function') {
                try {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: scrollBehavior
                    });
                    return;
                } catch (_) {
                    // fall back to direct assignment when smooth scrolling is unsupported
                }
            }
            container.scrollTop = container.scrollHeight;
        };

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(applyScroll);
        } else {
            applyScroll();
        }
    }

    handleConversationModeChange(mode) {
        if (mode === this.state.conversationMode) return;

        this.setState({ conversationMode: mode });
        // Placeholder for future integration
        // eslint-disable-next-line no-console
        console.log('[TalkWithMarty] Conversation mode changed:', mode);
    }

    handleInteractionModeChange(mode) {
        if (mode === this.state.interactionMode) return;

        const shouldResetListening = mode !== 'pushToTalk' && this.state.isListening;

        this.setState(({ isListening }) => ({
            interactionMode: mode,
            isListening: shouldResetListening ? false : isListening
        }));

        if (shouldResetListening) {
            this.stopRecording();
        }

        // Placeholder for future integration
        // eslint-disable-next-line no-console
        console.log('[TalkWithMarty] Interaction mode changed:', mode);
    }

    handleToggleListening() {
        if (this.state.isMicLoading || this.state.isProcessingAudio) {
            return;
        }

        if (this.state.isListening) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    handleMessageChange(event) {
        this.setState({ currentMessage: event.target.value, messageError: null });
    }

    handleSendMessage(event) {
        if (event) {
            event.preventDefault();
        }

        const trimmedMessage = this.state.currentMessage.trim();
        if (!trimmedMessage) return;

        const timestamp = new Date().toISOString();
        const nextEntry = {
            id: `${timestamp}-user`,
            sender: 'user',
            displayName: this.state.currentUser,
            text: trimmedMessage,
            timestamp
        };

        this.setState(prevState => ({
            transcript: [...prevState.transcript, nextEntry],
            currentMessage: '',
            messageError: null,
            isSendingText: true,
            isThinking: true
        }), () => {
            try { martyIsThinking(); } catch (_) { }
            this.sendTextRequest(trimmedMessage)
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.error('[TalkWithMarty] Text request failed', error);
                    if (this.isComponentMounted) {
                        this.setState({
                            messageError: this.props.intl.formatMessage(messages.textRequestFailed)
                        });
                    }
                })
                .finally(() => {
                    if (this.isComponentMounted) {
                        this.setState({ isSendingText: false, isThinking: false });
                    }
                });
        });
    }

    handleDownloadTranscript() {
        const { transcript } = this.state;
        if (!transcript.length) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `marty-transcript-${timestamp}.json`;
        const fileContents = JSON.stringify(transcript, null, 2);
        const blob = new Blob([fileContents], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Placeholder for future integration
        // eslint-disable-next-line no-console
        console.log('[TalkWithMarty] Download transcript', fileName);
    }

    handleSettingsChange(settingKey, value) {
        let nextValue = value;
        if (settingKey === 'model' && !AVAILABLE_LLM_MODELS.includes(value)) {
            nextValue = DEFAULT_LLM_MODEL;
        }
        this.setState(prevState => ({
            llmSettings: {
                ...prevState.llmSettings,
                [settingKey]: nextValue
            }
        }));

        // Placeholder for future integration
        // eslint-disable-next-line no-console
        console.log('[TalkWithMarty] Setting updated:', settingKey, nextValue);
    }

    handleClearTranscript() {
        // confirm before clearing
        const confirmed = window.confirm(this.props.intl.formatMessage(messages.transcriptClear) + '?');
        if (!confirmed) return;

        // revoke any existing object URLs
        if (this.state.lastRecordingUrl) {
            const urlCreator = window.URL || window.webkitURL;
            if (urlCreator) {
                urlCreator.revokeObjectURL(this.state.lastRecordingUrl);
            }
        }

        if (this.martySpeechUrl) {
            const urlCreator = window.URL || window.webkitURL;
            if (urlCreator) {
                urlCreator.revokeObjectURL(this.martySpeechUrl);
            }
            this.martySpeechUrl = '';
        }

        // also remove persisted transcript
        if (typeof window !== 'undefined' && window.localStorage) {
            try { window.localStorage.removeItem(LEGACY_TRANSCRIPT_STORAGE_KEY); } catch (_) { }
        }
        this.setState({
            transcript: [],
            lastRecordingUrl: '',
            recordingError: null,
            messageError: null
        }, () => {
            // eslint-disable-next-line no-console
            console.log('[TalkWithMarty] Transcript cleared');
        });
    }

    async ensureMediaStream() {
        if (!this.mediaSupportAvailable) {
            throw new Error(this.props.intl.formatMessage(messages.recordingUnsupported));
        }
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(this.props.intl.formatMessage(messages.recordingUnsupported));
        }
        if (this.mediaStream) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
        } catch (error) {
            throw error;
        }
    }

    async startRecording() {
        if (this.state.isListening || this.state.isMicLoading) {
            return;
        }

        if (!this.mediaSupportAvailable) {
            this.setState({ recordingError: this.props.intl.formatMessage(messages.recordingUnsupported) });
            return;
        }

        this.setState({
            isMicLoading: true,
            recordingError: null,
            isProcessingAudio: false,
            recordingStatus: 'preparing'
        });
        try {
            await this.ensureMediaStream();
            if (!this.mediaStream) {
                throw new Error(this.props.intl.formatMessage(messages.recordingGenericError));
            }

            this.audioChunks = [];
            if (this.mediaRecorder) {
                this.mediaRecorder.removeEventListener('dataavailable', this.handleAudioChunk);
                this.mediaRecorder.removeEventListener('stop', this.handleRecorderStop);
            }

            const recorder = new window.MediaRecorder(this.mediaStream);
            recorder.addEventListener('dataavailable', this.handleAudioChunk);
            recorder.addEventListener('stop', this.handleRecorderStop);
            const markRecordingStart = async () => {
                recorder.removeEventListener('start', markRecordingStart);
                await new Promise(resolve => setTimeout(resolve, PREPARING_PROGRESS_DURATION_MS));
                if (this.isComponentMounted && this.mediaRecorder === recorder && recorder.state === 'recording' && this.state.recordingStatus === 'preparing') {
                    this.setState({ recordingStatus: 'recording' });
                }
            };
            recorder.addEventListener('start', markRecordingStart);
            this.mediaRecorder = recorder;
            recorder.start();
            if (recorder.state === 'recording') {
                if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                    window.requestAnimationFrame(markRecordingStart);
                } else {
                    setTimeout(markRecordingStart, 0);
                }
            }

            if (this.isComponentMounted && this.state.recordingStatus === 'recording') {
                this.setState({ isListening: true, isMicLoading: false, isSpeaking: false });
                try { martyIsListening(); } catch (_) { }
            } else if (this.isComponentMounted) {
                this.setState({ isListening: false, isMicLoading: false, isSpeaking: false });
            }

            // Placeholder for future integration
            // eslint-disable-next-line no-console
            console.log('[TalkWithMarty] Recording started');
        } catch (error) {
            this.handleRecordingError(error);
        }
    }

    async stopRecording() {
        this.activeUserKey = null;
        if (this.state.isMicLoading) {
            // try again in 1 second
            console.log("stopRecording delayed");
            setTimeout(this.stopRecording, 1000);
            return;
        }

        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            if (this.isComponentMounted) {
                this.setState({ isListening: false, recordingStatus: 'idle' });
            }
            return;
        }

        try {
            this.mediaRecorder.stop();

            // Placeholder for future integration
            // eslint-disable-next-line no-console
            console.log('[TalkWithMarty] Recording stopped');
        } catch (error) {
            this.handleRecordingError(error);
        }
    }

    handleAudioChunk(event) {
        if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
        }
    }

    playRecordingPreview(url) {
        if (!url || typeof window === 'undefined') {
            return;
        }

        try {
            if (this.lastRecordingAudio) {
                this.lastRecordingAudio.pause();
                this.lastRecordingAudio.src = '';
                this.lastRecordingAudio = null;
            }

            const audio = new window.Audio(url);
            audio.addEventListener('ended', () => {
                if (this.lastRecordingAudio === audio) {
                    this.lastRecordingAudio = null;
                }
            });
            audio.addEventListener('error', error => {
                // eslint-disable-next-line no-console
                console.warn('[TalkWithMarty] Failed to play last recording preview', error);
            });
            const maybePlayPromise = audio.play();
            if (maybePlayPromise && typeof maybePlayPromise.catch === 'function') {
                maybePlayPromise.catch(error => {
                    // eslint-disable-next-line no-console
                    console.warn('[TalkWithMarty] Autoplay blocked for last recording preview', error);
                });
            }
            this.lastRecordingAudio = audio;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Unable to start last recording preview', error);
        }
    }

    handleRecorderStop() {
        const blob = this.audioChunks.length
        ? new Blob(this.audioChunks, { type: (this.mediaRecorder && this.mediaRecorder.mimeType) || 'audio/webm' })
        : null;
        
        this.audioChunks = [];
        let shouldProcess = false;
        if (blob && blob.size > 500 && this.state.recordingStatus === 'recording') {
            if (this.isComponentMounted) {
                this.setState({ isListening: false, isMicLoading: true, recordingStatus: 'idle' });
            }
            const urlCreator = window.URL || window.webkitURL;
            const url = urlCreator ? urlCreator.createObjectURL(blob) : '';
            if (this.state.lastRecordingUrl) {
                const existingUrlCreator = window.URL || window.webkitURL;
                if (existingUrlCreator) {
                    existingUrlCreator.revokeObjectURL(this.state.lastRecordingUrl);
                }
            }
            if (this.isComponentMounted) {
                const stateUpdates = {
                    recordingError: null,
                    isMicLoading: false,
                    recordingStatus: 'idle'
                };
                if (url) {
                    stateUpdates.lastRecordingUrl = url;
                }
                this.setState(stateUpdates);
            }

            // Placeholder for future integration
            // eslint-disable-next-line no-console
            console.log('[TalkWithMarty] Recorded audio clip', {
                size: blob.size,
                type: blob.type,
                url
            });
            // this.playRecordingPreview(url);
            shouldProcess = true;
        } else if (this.isComponentMounted) {
            this.setState({ isMicLoading: false, isListening: false, recordingStatus: 'idle' });
        }

        if (shouldProcess) {
            this.processRecording(blob);
        }
    }

    handleRecordingError(error) {
        const { intl } = this.props;
        let message = intl.formatMessage(messages.recordingGenericError);
        if (error && error.name) {
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                message = intl.formatMessage(messages.recordingPermissionDenied);
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                message = intl.formatMessage(messages.recordingDeviceNotFound);
            } else if (error.message === intl.formatMessage(messages.recordingUnsupported)) {
                message = error.message;
            }
        } else if (typeof error === 'string') {
            message = error;
        }

        // Placeholder for future integration
        // eslint-disable-next-line no-console
        console.error('[TalkWithMarty] Recording error', error);

        if (this.isComponentMounted) {
            this.setState({
                recordingError: message,
                isListening: false,
                isMicLoading: false,
                isProcessingAudio: false,
                recordingStatus: 'idle'
            });
        }

        this.activeUserKey = null;
        this.disposeMedia();
    }

    async processRecording(blob) {
        // capture user at start of processing for speech attribution
        this.pendingSpeechUserName = this.state.currentUser;

        if (!blob) {
            return;
        }

        if (this.isComponentMounted) {
            this.setState({ isProcessingAudio: true, isThinking: false });
        }

        try {
            const mimeType = blob.type || 'audio/webm';
            const extension = this.getExtensionFromMime(mimeType);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `talk-with-marty-${timestamp}.${extension}`;
            const arrayBuffer = await blob.arrayBuffer();
            const payload = {
                blob,
                fileName,
                mimeType,
                size: blob.size,
                arrayBuffer,
                formData: this.buildWhisperFormData(blob, fileName)
            };

            if (this.props.onAudioCaptured) {
                await this.props.onAudioCaptured(payload);
            }

            const requestPayload = this.buildSpeechRequestPayload(arrayBuffer, mimeType);
            if (this.isComponentMounted) {
                this.setState({ isThinking: true });
            }
            try { martyIsThinking(); } catch (_) { }
            const response = await this.sendSpeechRequest(requestPayload);
            if (this.isComponentMounted) {
                this.setState({ isThinking: false });
            }
            this.applySpeechResponse(response);
            if (response && response.speech) {
                this.handleSpeechAudioResult(response.speech.audio);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[TalkWithMarty] Error processing recording', error);
            if (this.isComponentMounted) {
                this.setState({
                    recordingError: this.props.intl.formatMessage(messages.speechRequestFailed)
                });
            }
        } finally {
            if (this.isComponentMounted) {
                this.setState({ isProcessingAudio: false, isThinking: false });
            }
        }
    }

    buildWhisperFormData(blob, fileName) {
        if (typeof FormData === 'undefined') {
            return null;
        }

        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');

        return formData;
    }

    getExtensionFromMime(mimeType) {
        if (!mimeType) {
            return 'webm';
        }
        const normalized = mimeType.split(';')[0];
        if (normalized === 'audio/webm' || normalized === 'audio/webm;codecs=opus') {
            return 'webm';
        }
        if (normalized === 'audio/ogg') {
            return 'ogg';
        }
        if (normalized === 'audio/wav' || normalized === 'audio/x-wav') {
            return 'wav';
        }
        if (normalized === 'audio/mpeg') {
            return 'mp3';
        }
        if (normalized === 'audio/mp4' || normalized === 'audio/m4a') {
            return 'm4a';
        }
        const parts = normalized.split('/');
        return parts.length > 1 ? parts[1] : 'webm';
    }

    buildConversationHistory() {
        if (this.state.conversationMode === 'qa') {
            return [];
        }

        return this.state.transcript.map(entry => ({
            role: entry.sender === 'marty' ? 'assistant' : 'user',
            content: entry.sender === 'user' && entry.displayName
                ? `${entry.displayName}: ${entry.text}`
                : entry.text,
            timestamp: entry.timestamp
        }));
    }

    async sendTextRequest(message) {
        let activeJobId = null;
        try {
            this.resetActiveTextJobResources({ resetState: true });

            const payload = this.buildTextRequestPayload(message);
            const initialResponse = await this.postJson(
                `${serverUrl}/talkWithMarty/talk-with-marty-using-text`,
                payload
            );
            const initialStatus = initialResponse ? initialResponse.status : null;
            const initialData = initialResponse ? initialResponse.data : null;

            if (initialStatus === 202) {
                if (!initialData || typeof initialData !== 'object') {
                    throw new Error('Server response missing job information.');
                }

                const jobInfo = {
                    jobId: initialData.jobId,
                    statusUrl: this.ensureAbsoluteServerUrl(initialData.statusUrl || initialData.statusEndpoint),
                    streamUrl: this.ensureAbsoluteServerUrl(initialData.streamUrl || initialData.streamEndpoint)
                };

                if (!jobInfo.jobId || !jobInfo.statusUrl) {
                    throw new Error('Talk With Marty job details are incomplete.');
                }

                this.activeTextJob = { jobId: jobInfo.jobId, entryId: null };
                activeJobId = jobInfo.jobId;

                if (this.isComponentMounted) {
                    this.setState({
                        activeTextJobId: jobInfo.jobId,
                        activeTextJobStatus: initialData.status || 'pending'
                    });
                }

                const finalPayload = await this.waitForTextJobCompletion(jobInfo);
                console.log("finalPayload:", finalPayload);
                if (!finalPayload) {
                    throw new Error('Talk With Marty job did not return a final response.');
                }

                const normalizedFinal = this.normalizeTalkWithMartyPayload(finalPayload);
                await this.applyNormalizedTextResponse(normalizedFinal, jobInfo.jobId);
            } else {
                const normalizedImmediate = this.normalizeTalkWithMartyPayload(initialData);
                await this.applyNormalizedTextResponse(normalizedImmediate, null);
            }
        } catch (error) {
            if (activeJobId &&
                this.activeTextJob &&
                this.activeTextJob.jobId === activeJobId &&
                this.activeTextJob.entryId) {
                this.removeTranscriptEntry(this.activeTextJob.entryId);
            }
            if (this.isComponentMounted) {
                this.setState({ isSpeaking: false });
            }
            try { martyStopsTalking(); } catch (_) { }
            this.resetActiveTextJobResources({ resetState: true });
            throw error;
        } finally {
            this.resetActiveTextJobResources({ resetState: true });
        }
    }

    async handleSpeechAudioResult(audioData) {
        if (!audioData) {
            return;
        }

        let uint8Array = null;

        if (audioData instanceof ArrayBuffer) {
            uint8Array = new Uint8Array(audioData);
        } else if (Array.isArray(audioData)) {
            uint8Array = new Uint8Array(audioData);
        } else if (audioData && typeof audioData === 'object' && Array.isArray(audioData.data)) {
            uint8Array = new Uint8Array(audioData.data);
        } else if (typeof audioData === 'string') {
            try {
                const binaryString = atob(audioData);
                const length = binaryString.length;
                const bytes = new Uint8Array(length);
                for (let i = 0; i < length; i += 1) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                uint8Array = bytes;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('[TalkWithMarty] Failed to decode speech audio result', error);
                return;
            }
        }

        if (!uint8Array) {
            console.warn('[TalkWithMarty] Unable to process speech audio result: unrecognized format');
            return;
        }
        const playMarty = async () => {
            // stream to marty
            console.log('[TalkWithMarty] Streaming audio to Marty');

            const targetId = window.vm && window.vm.runtime && window.vm.runtime._editingTarget.id;
            if (!targetId) {
                console.warn('[TalkWithMarty] Unable to stream audio to Marty: target ID not found');
                return;
            }
            const connectedRaft = getRaftUsingTargetId(targetId);
            if (!connectedRaft || !connectedRaft.streamAudio) {
                console.warn('[TalkWithMarty] Unable to stream audio to Marty: raft connection not found');
                return;
            }

            // 1) Ensure we have a Uint8Array of the audio bytes (you already built uint8Array above)
            const bytes = uint8Array;

            // 2) Decode to AudioBuffer to get duration (works for MP3/WAV/WEBM/etc)
            const audioCtx = window.__twAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
            window.__twAudioCtx = audioCtx;
            // In some browsers the context is suspended until a user gesture:
            if (audioCtx.state === 'suspended') { try { await audioCtx.resume(); } catch (_) { } }

            let audioBuffer;
            try {
                // slice(0) to pass a detached copy the decoder accepts
                audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
            } catch (e) {
                console.error('[TalkWithMarty] decodeAudioData failed; cannot derive duration', e);
                return;
            }

            const durationSeconds = audioBuffer.duration;
            // 3A) If you ALREADY have MP3 bytes (e.g., response is MP3):
            // -> stream the raw MP3 bytes directly
            // connectedRaft.streamAudio(bytes, false, durationSeconds);
            // return;

            // 3B) If you need to CONVERT to MP3 using the Scratch helpers:
            // NOTE: convertSoundToMP3 expects an AudioBuffer, not ArrayBuffer.
            const mp3SoundBuffers = window.Scratch3Mv2Blocks.convertSoundToMP3(audioBuffer);
            const mp3SoundData = window.Scratch3Mv2Blocks.convertMp3BufferToData(mp3SoundBuffers);

            // If streamAudio wants Uint8Array, pass mp3SoundData.
            // If it wants ArrayBuffer, pass mp3SoundData.buffer.
            connectedRaft.streamAudio(mp3SoundData, false, durationSeconds * 1000);
            // return;
        }
        window.playMarty = playMarty;
        await playMarty().catch(error => {
            console.error('[TalkWithMarty] Error playing audio', error);
        });
        console.log("after playMarty");
        // comment in the return to playback locally as well
        // return;

        const urlCreator = window.URL || window.webkitURL;
        if (!urlCreator) {
            return;
        }

        if (this.martySpeechUrl) {
            urlCreator.revokeObjectURL(this.martySpeechUrl);
        }

        const blob = new Blob([uint8Array.buffer], { type: 'audio/mpeg' });
        this.martySpeechUrl = urlCreator.createObjectURL(blob);

        const audio = new Audio(this.martySpeechUrl);
        audio.onplay = () => {
            if (this.isComponentMounted) {
                this.setState({ isSpeaking: true });
            }
            try { martyStartsTalking(); } catch (_) { }
        };
        audio.onended = () => {
            if (this.isComponentMounted) {
                this.setState({ isSpeaking: false });
            }
            try { martyStopsTalking(); } catch (_) { }
        };
        audio.play().catch(error => {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Unable to autoplay Marty response audio', error);
            if (this.isComponentMounted) {
                this.setState({ isSpeaking: false });
            }
            try { martyStopsTalking(); } catch (_) { }
        });
    }


    buildLLMSettingsForRequest() {
        const { safeguards, instructions } = this.state.llmSettings || {};
        const teacherSourceSettings = this.llmSettingsSource === 'server'
            ? this.serverTeacherLLMSettings
            : this.teacherLLMSettings;
        const teacherSettings = teacherSourceSettings || {};
        const {
            importantInstructions,
            importantSafeguards,
            knowledgeBase
        } = teacherSettings;

        const studentInstructions = typeof instructions === 'string' ? instructions.trim() : '';
        const studentSafeguards = typeof safeguards === 'string' ? safeguards.trim() : '';

        const combinedInstructions = [importantInstructions, studentInstructions]
            .filter(Boolean)
            .join('\n\n');
        const combinedSafeguards = [importantSafeguards, studentSafeguards]
            .filter(Boolean)
            .join('\n\n');

        const settings = {};
        if (importantInstructions) {
            settings.importantInstructions = importantInstructions;
        }
        if (combinedInstructions) {
            settings.instructions = combinedInstructions;
        }
        if (importantSafeguards) {
            settings.importantSafeguards = importantSafeguards;
        }
        if (combinedSafeguards) {
            settings.safeguards = combinedSafeguards;
        }
        if (knowledgeBase) {
            settings.knowledgeBase = knowledgeBase;
        }
        console.log('LLM request settings', settings, 'source', this.llmSettingsSource);
        return {
            ...settings,
            userName: this.state.currentUser,
            students: this.state.users
        };
    }

    getLLMModelMetadata(model) {
        if (model && LLM_MODEL_METADATA[model]) {
            return LLM_MODEL_METADATA[model];
        }
        if (LLM_MODEL_METADATA[DEFAULT_LLM_MODEL]) {
            return LLM_MODEL_METADATA[DEFAULT_LLM_MODEL];
        }
        return { provider: 'openai' };
    }

    buildFrameEngineProviderConfig(selectedModel) {
        const useCodeFrame = this.state.llmSettings && this.state.llmSettings.useCodeFrame !== false;
        const metadata = this.getLLMModelMetadata(selectedModel);
        return {
            session: {
                useCodeFrame
            },
            llm: {
                provider: metadata.provider || 'openai',
                model: selectedModel || DEFAULT_LLM_MODEL
            }
        };
    }

    getSelectedLLMModel() {
        const { llmSettings } = this.state;
        if (llmSettings && typeof llmSettings.model === 'string' && AVAILABLE_LLM_MODELS.includes(llmSettings.model)) {
            return llmSettings.model;
        }
        return DEFAULT_LLM_MODEL;
    }

    shouldIncludeSpeech() {
        return true;
        return Boolean(this.state.llmSettings.personalityVoice && this.state.llmSettings.personalityVoice.trim());
    }

    buildSpeechRequestPayload(arrayBuffer, mimeType) {
        const includeSpeech = this.shouldIncludeSpeech();
        const selectedModel = this.getSelectedLLMModel();
        const providerConfig = this.buildFrameEngineProviderConfig(selectedModel);
        const llmConfig = {
            provider: FRAME_ENGINE_PROVIDER,
            conversationHistory: this.buildConversationHistory(),
            settings: this.buildLLMSettingsForRequest(),
            model: selectedModel
        };
        if (providerConfig) {
            llmConfig.providerConfig = providerConfig;
        }
        const payload = {
            audioBuffer: Array.from(new Uint8Array(arrayBuffer)),
            stt: {
                provider: 'openai-whisper',
                config: { mimeType }
            },
            llm: llmConfig,
            includeSpeech,
            includeTranscript: true,
            userName: this.state.currentUser
        };

        if (includeSpeech) {
            payload.tts = {
                provider: 'azure'
                // removed voice options (personalityVoice no longer exists)
            };
        }
        return payload;
    }

    buildTextRequestPayload(message) {
        const includeSpeech = this.shouldIncludeSpeech();
        const selectedModel = this.getSelectedLLMModel();
        const providerConfig = this.buildFrameEngineProviderConfig(selectedModel);
        const llmConfig = {
            provider: FRAME_ENGINE_PROVIDER,
            conversationHistory: this.buildConversationHistory(),
            settings: this.buildLLMSettingsForRequest(),
            model: selectedModel
        };
        if (providerConfig) {
            llmConfig.providerConfig = providerConfig;
        }
        const payload = {
            text: message,
            llm: llmConfig,
            includeSpeech,
            userName: this.state.currentUser
        };
        if (includeSpeech) {
            payload.tts = {
                provider: 'azure'
            };
        }
        return payload;
    }

    ensureAbsoluteServerUrl(candidate) {
        if (!candidate || typeof candidate !== 'string') {
            return candidate;
        }

        const trimmed = candidate.trim();
        if (!trimmed) {
            return trimmed;
        }

        try {
            if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
                return trimmed;
            }

            if (trimmed.startsWith('//')) {
                const baseUrl = new URL(serverUrl);
                return `${baseUrl.protocol}${trimmed}`;
            }

            const base = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
            return new URL(trimmed, base).toString();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Failed to resolve server URL', trimmed, error);
            return trimmed;
        }
    }

    normalizeTalkWithMartyPayload(payload) {
        console.log("normalizeTalkWithMartyPayload:", payload);
        if (!payload) {
            return {
                status: null,
                llm: null,
                speech: null,
                error: null,
                raw: payload
            };
        }

        if (typeof payload === 'string') {
            const normalized = payload.trim();
            const lowered = normalized.toLowerCase();
            return {
                status: lowered === 'completed' || lowered === 'failed' ? lowered : null,
                llm: null,
                speech: null,
                error: lowered === 'failed' ? normalized : null,
                raw: payload
            };
        }

        const status = typeof payload.status === 'string'
            ? payload.status
            : typeof payload.state === 'string'
                ? payload.state
                : null;

        const candidateContainers = [
            payload.result,
            payload.payload,
            payload.data,
            payload.response
        ];

        let container = payload;
        for (let index = 0; index < candidateContainers.length; index += 1) {
            const candidate = candidateContainers[index];
            if (candidate && typeof candidate === 'object' &&
                (candidate.llm || candidate.speech || candidate.error)) {
                container = candidate;
                break;
            }
        }

        const llm = container && typeof container === 'object' ? container.llm || null : null;
        const speech = container && typeof container === 'object' ? container.speech || null : null;
        const errorMessage = payload.error ||
            (container && typeof container === 'object' && container.error) ||
            null;

        return {
            status,
            llm,
            speech,
            error: errorMessage,
            raw: payload
        };
    }

    upsertMartyTranscriptEntry(jobId, normalizedPayload) {
        if (!normalizedPayload || !this.activeTextJob || this.activeTextJob.jobId !== jobId) {
            return;
        }

        const { llm } = normalizedPayload;
        if (!llm || typeof llm.text !== 'string') {
            return;
        }

        const metadata = llm.raw ? { raw: llm.raw } : undefined;
        if (!this.activeTextJob.entryId) {
            const entry = this.createTranscriptEntry(
                'marty',
                llm.text,
                llm.timestamp,
                metadata
            );
            this.activeTextJob.entryId = entry.id;
            this.appendTranscriptEntries([entry]);
            return;
        }

        if (!this.isComponentMounted) {
            return;
        }

        const entryId = this.activeTextJob.entryId;
        this.setState(prevState => {
            const entryIndex = prevState.transcript.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                const fallbackEntry = {
                    id: entryId,
                    sender: 'marty',
                    text: llm.text,
                    timestamp: llm.timestamp || new Date().toISOString()
                };
                if (metadata) {
                    fallbackEntry.metadata = metadata;
                }
                return {
                    transcript: [...prevState.transcript, fallbackEntry]
                };
            }

            const nextTranscript = prevState.transcript.slice();
            const currentEntry = { ...nextTranscript[entryIndex] };
            currentEntry.text = llm.text;
            if (llm.timestamp) {
                currentEntry.timestamp = llm.timestamp;
            }
            if (metadata) {
                currentEntry.metadata = {
                    ...(currentEntry.metadata || {}),
                    ...metadata
                };
            }
            nextTranscript[entryIndex] = currentEntry;
            return { transcript: nextTranscript };
        });
    }

    handleTextJobUpdate(jobId, rawPayload) {
        if (!this.activeTextJob || this.activeTextJob.jobId !== jobId) {
            return;
        }

        const normalized = this.normalizeTalkWithMartyPayload(rawPayload);
        if (this.isComponentMounted && normalized.status) {
            this.setState(prevState => {
                if (prevState.activeTextJobId === jobId && prevState.activeTextJobStatus === normalized.status) {
                    return null;
                }
                return {
                    activeTextJobId: jobId,
                    activeTextJobStatus: normalized.status
                };
            });
        }
        this.upsertMartyTranscriptEntry(jobId, normalized);
        if (this.isPayloadComplete(normalized)) {
            this.activeTextJobLastPayload = { jobId, payload: normalized };
        } else if (normalized && typeof normalized.status === 'string') {
            const existing = this.activeTextJobLastPayload;
            if (existing && existing.jobId === jobId) {
                const existingPayload = existing.payload || {};
                const mergedStatus = normalized.status || existingPayload.status;
                const merged = {
                    ...existingPayload,
                    status: mergedStatus
                };
                this.activeTextJobLastPayload = { jobId, payload: merged };
            }
        }
    }

    delay(durationMs) {
        return new Promise(resolve => {
            if (this.activeTextJobDelayTimeout) {
                clearTimeout(this.activeTextJobDelayTimeout);
            }
            this.activeTextJobDelayTimeout = setTimeout(() => {
                this.activeTextJobDelayTimeout = null;
                resolve();
            }, durationMs);
        });
    }

    resetActiveTextJobResources(options = {}) {
        const { resetState = false } = options;

        if (this.activeTextJobEventSource) {
            try {
                this.activeTextJobEventSource.close();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('[TalkWithMarty] Failed to close EventSource', error);
            }
            this.activeTextJobEventSource = null;
        }

        if (this.activeTextJobAbortController) {
            try {
                this.activeTextJobAbortController.abort();
            } catch (_) {
                // ignore abort issues
            }
            this.activeTextJobAbortController = null;
        }

        if (this.activeTextJobDelayTimeout) {
            clearTimeout(this.activeTextJobDelayTimeout);
            this.activeTextJobDelayTimeout = null;
        }

        this.activeTextJobLastPayload = null;

        if (resetState) {
            this.activeTextJob = null;
            if (this.isComponentMounted) {
                this.setState({
                    activeTextJobId: null,
                    activeTextJobStatus: null
                });
            }
        }
    }

    safeParseEventData(rawData) {
        if (rawData === null || rawData === undefined) {
            return null;
        }

        if (typeof rawData === 'object') {
            return rawData;
        }

        if (typeof rawData !== 'string') {
            return rawData;
        }

        const trimmed = rawData.trim();
        if (!trimmed) {
            return null;
        }

        try {
            return JSON.parse(trimmed);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('[TalkWithMarty] Failed to parse event data', error);
            return trimmed;
        }
    }

    resolveNormalizedPayload(normalizedPayload, jobId) {
        if (!jobId) {
            return normalizedPayload;
        }

        const fallbackRecord = this.activeTextJobLastPayload;
        if (!fallbackRecord || fallbackRecord.jobId !== jobId || !fallbackRecord.payload) {
            return normalizedPayload;
        }

        if (!normalizedPayload) {
            return fallbackRecord.payload;
        }

        const originalStatus = typeof normalizedPayload.status === 'string'
            ? normalizedPayload.status.toLowerCase()
            : null;
        if (originalStatus && originalStatus !== 'completed' && originalStatus !== 'success' && originalStatus !== 'succeeded') {
            return normalizedPayload;
        }

        const fallbackPayload = fallbackRecord.payload;
        const merged = { ...normalizedPayload };

        const needsLLM = !merged.llm || typeof merged.llm.text !== 'string';
        if (needsLLM && fallbackPayload.llm && typeof fallbackPayload.llm.text === 'string') {
            merged.llm = fallbackPayload.llm;
        }

        const needsSpeech = !merged.speech || !merged.speech.audio;
        if (needsSpeech && fallbackPayload.speech && fallbackPayload.speech.audio) {
            merged.speech = fallbackPayload.speech;
        }

        if (!merged.raw && fallbackPayload.raw) {
            merged.raw = fallbackPayload.raw;
        }

        if (!merged.status && fallbackPayload.status) {
            merged.status = fallbackPayload.status;
        }

        return merged;
    }

    isPayloadComplete(normalized) {
        if (!normalized || typeof normalized !== 'object') {
            return false;
        }
        const hasLLMText = normalized.llm &&
            typeof normalized.llm.text === 'string' &&
            normalized.llm.text.trim();
        const hasSpeechAudio = normalized.speech &&
            normalized.speech.audio &&
            (Array.isArray(normalized.speech.audio) || normalized.speech.audio instanceof ArrayBuffer);
        return Boolean(hasLLMText || hasSpeechAudio);
    }

    async waitForTextJobCompletion(jobInfo) {
        const canStream = typeof window !== 'undefined' &&
            typeof window.EventSource !== 'undefined' &&
            jobInfo.streamUrl;

        if (canStream) {
            try {
                const streamedFinalPayload = await this.streamTextJobUpdates(jobInfo);
                if (streamedFinalPayload && typeof streamedFinalPayload === 'object') {
                    console.log("streamedFinalPayload:", streamedFinalPayload);
                    return streamedFinalPayload;
                }
            } catch (streamError) {
                // eslint-disable-next-line no-console
                console.warn('[TalkWithMarty] SSE stream failed, falling back to polling', streamError);
            }
        }

        return this.pollTextJobStatus(jobInfo);
    }

    streamTextJobUpdates(jobInfo) {
        const EventSourceConstructor = typeof window !== 'undefined' ? window.EventSource : null;
        if (!EventSourceConstructor || !jobInfo.streamUrl) {
            return Promise.resolve(null);
        }

        return new Promise((resolve, reject) => {
            const source = new EventSourceConstructor(jobInfo.streamUrl);
            let isSettled = false;

            this.activeTextJobEventSource = source;

            const cleanup = () => {
                if (this.activeTextJobEventSource === source) {
                    this.activeTextJobEventSource = null;
                }
                source.removeEventListener('update', handleUpdate);
                source.removeEventListener('end', handleEnd);
                source.removeEventListener('error', handleError);
                if (typeof source.close === 'function') {
                    try { source.close(); } catch (_) { }
                }
            };

            const settle = (fn, value) => {
                if (isSettled) return;
                isSettled = true;
                cleanup();
                fn(value);
            };

            const handleUpdate = event => {
                const payload = this.safeParseEventData(event && event.data);
                if (payload) {
                    this.handleTextJobUpdate(jobInfo.jobId, payload);
                }
            };

            const handleEnd = event => {
                const payload = this.safeParseEventData(event && event.data);
                if (payload) {
                    this.handleTextJobUpdate(jobInfo.jobId, payload);
                }
                settle(resolve, payload);
            };

            const handleError = error => {
                settle(reject, error || new Error('TalkWithMarty SSE stream error'));
            };

            source.addEventListener('update', handleUpdate);
            source.addEventListener('end', handleEnd);
            source.addEventListener('error', handleError);
            source.onerror = handleError;
        });
    }

    async pollTextJobStatus(jobInfo) {
        const pollIntervalMs = 1500;

        while (this.isComponentMounted && this.activeTextJob && this.activeTextJob.jobId === jobInfo.jobId) {
            let response;
            let responseData = null;

            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            if (controller) {
                this.activeTextJobAbortController = controller;
            }

            try {
                response = await fetch(jobInfo.statusUrl, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    signal: controller ? controller.signal : undefined
                });
            } catch (error) {
                if (controller && controller.signal && controller.signal.aborted) {
                    throw error;
                }
                throw error;
            } finally {
                if (this.activeTextJobAbortController === controller) {
                    this.activeTextJobAbortController = null;
                }
            }

            const contentType = response.headers.get('Content-Type') || '';
            const responseText = await response.text();
            if (responseText) {
                if (contentType.includes('application/json')) {
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (parseError) {
                        // eslint-disable-next-line no-console
                        console.warn('[TalkWithMarty] Failed to parse status response', parseError);
                        responseData = responseText;
                    }
                } else {
                    responseData = responseText;
                }
            }

            if (response.status >= 400) {
                const message = responseData && typeof responseData === 'object'
                    ? responseData.error || responseData.message || JSON.stringify(responseData)
                    : typeof responseData === 'string'
                        ? responseData
                        : `Status request failed with status ${response.status}`;
                const error = new Error(message);
                error.status = response.status;
                error.data = responseData;
                throw error;
            }

            if (responseData && typeof responseData === 'object') {
                this.handleTextJobUpdate(jobInfo.jobId, responseData);
            }

            if (response.status === 200) {
                return responseData;
            }

            if (response.status !== 202) {
                const unexpected = new Error(`Unexpected job status response: ${response.status}`);
                unexpected.status = response.status;
                unexpected.data = responseData;
                throw unexpected;
            }

            await this.delay(pollIntervalMs);
        }

        return null;
    }

    async applyNormalizedTextResponse(normalizedPayload, jobId) {
        if (!normalizedPayload) {
            return;
        }

        if (normalizedPayload.status === 'failed') {
            const errorMessage = normalizedPayload.error ||
                this.props.intl.formatMessage(messages.textRequestFailed);
            const error = new Error(errorMessage);
            error.data = normalizedPayload.raw;
            throw error;
        }

        const payloadToApply = this.resolveNormalizedPayload(normalizedPayload, jobId) || normalizedPayload;
        if (jobId) {
            const isComplete = this.isPayloadComplete(payloadToApply);
            if (!isComplete) {
                this.upsertMartyTranscriptEntry(jobId, payloadToApply);
                const fallbackRecord = this.activeTextJobLastPayload;
                const fallbackPayload = fallbackRecord && fallbackRecord.jobId === jobId
                    ? fallbackRecord.payload
                    : null;
                if (!fallbackPayload || !this.isPayloadComplete(fallbackPayload)) {
                    return;
                }
                return this.applyNormalizedTextResponse(fallbackPayload, jobId);
            }
        }

        if (jobId) {
            this.upsertMartyTranscriptEntry(jobId, payloadToApply);
        } else if (payloadToApply.llm && typeof payloadToApply.llm.text === 'string') {
            const metadata = payloadToApply.llm.raw ? { raw: payloadToApply.llm.raw } : undefined;
            const entry = this.createTranscriptEntry(
                'marty',
                payloadToApply.llm.text,
                payloadToApply.llm.timestamp,
                metadata
            );
            this.appendTranscriptEntries([entry]);
        }

        if (payloadToApply.speech && payloadToApply.speech.audio) {
            await this.handleSpeechAudioResult(payloadToApply.speech.audio);
        } else {
            if (this.isComponentMounted) {
                this.setState({ isSpeaking: false });
            }
            try { martyStopsTalking(); } catch (_) { }
        }
    }

    async sendSpeechRequest(payload) {
        const response = await this.postJson(
            `${serverUrl}/talkWithMarty/talk-with-marty-using-speech`,
            payload
        );
        return response ? response.data : null;
    }

    applySpeechResponse(response, forcedUserName) {
        if (!response) return;
        const userName = forcedUserName || this.pendingSpeechUserName || this.state.currentUser;
        const entriesToAdd = [];
        if (response.transcript && response.transcript.text) {
            entriesToAdd.push(this.createTranscriptEntry(
                'user',
                response.transcript.text,
                response.transcript.timestamp,
                { raw: response.transcript.raw },
                userName
            ));
        }
        if (response.llm && response.llm.text) {
            entriesToAdd.push(this.createTranscriptEntry(
                'marty',
                response.llm.text,
                response.llm.timestamp,
                { raw: response.llm.raw }
            ));
        }
        if (entriesToAdd.length) this.appendTranscriptEntries(entriesToAdd);
    }

    createTranscriptEntry(sender, text, timestamp, metadata, displayName) {
        const entryTimestamp = timestamp || new Date().toISOString();
        const uniqueSuffix = Math.random().toString(16).slice(2, 8);
        const entry = {
            id: `${entryTimestamp}-${sender}-${uniqueSuffix}`,
            sender,
            text,
            timestamp: entryTimestamp
        };
        if (displayName && sender === 'user') {
            entry.displayName = displayName;
        }
        if (metadata) entry.metadata = metadata;
        return entry;
    }

    appendTranscriptEntries(entries) {
        if (!entries || !entries.length) {
            return;
        }

        this.setState(prevState => ({
            transcript: [...prevState.transcript, ...entries]
        }));
    }

    removeTranscriptEntry(entryId) {
        if (!entryId || !this.isComponentMounted) {
            return;
        }

        this.setState(prevState => {
            const index = prevState.transcript.findIndex(entry => entry.id === entryId);
            if (index === -1) {
                return null;
            }
            const nextTranscript = prevState.transcript.slice();
            nextTranscript.splice(index, 1);
            return { transcript: nextTranscript };
        });
    }

    async postJson(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get('Content-Type') || '';
        const responseText = await response.text();

        let data = null;
        if (responseText) {
            if (contentType.includes('application/json')) {
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    // eslint-disable-next-line no-console
                    console.warn('[TalkWithMarty] Failed to parse JSON response', parseError);
                    data = responseText;
                }
            } else {
                data = responseText;
            }
        }

        if (!response.ok) {
            const messageFromObject = data && typeof data === 'object'
                ? data.error || data.message || JSON.stringify(data)
                : null;
            const errorMessage = messageFromObject || (typeof data === 'string' ? data : '') ||
                `Request failed with status ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return {
            status: response.status,
            data
        };
    }

    disposeMedia() {
        if (this.mediaRecorder) {
            this.mediaRecorder.removeEventListener('dataavailable', this.handleAudioChunk);
            this.mediaRecorder.removeEventListener('stop', this.handleRecorderStop);
            if (this.mediaRecorder.state !== 'inactive') {
                try {
                    this.mediaRecorder.stop();
                } catch (error) {
                    // ignore
                }
            }
            this.mediaRecorder = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    sanitizeStoredUsers(rawUsers) {
        const input = Array.isArray(rawUsers) ? rawUsers : [];
        const sanitized = [];
        const seenNames = new Set();
        const seenKeys = new Set();

        input.forEach((entry, index) => {
            if (!entry || typeof entry !== 'object') return;
            const rawName = typeof entry.name === 'string' ? entry.name.trim() : '';
            const fallbackName = `User ${sanitized.length + 1}`;
            const safeName = rawName || fallbackName;
            if (seenNames.has(safeName)) return;

            let candidateKey = typeof entry.key === 'string' ? entry.key.trim() : '';
            if (candidateKey && seenKeys.has(candidateKey.toLowerCase())) {
                candidateKey = '';
            }
            if (!candidateKey) {
                candidateKey = AVAILABLE_USER_KEYS.find(key => !seenKeys.has(key.toLowerCase())) || '';
            }
            if (candidateKey) {
                seenKeys.add(candidateKey.toLowerCase());
            }
            seenNames.add(safeName);
            sanitized.push({ name: safeName, key: candidateKey });
        });

        if (!sanitized.length) {
            return [{ name: 'You', key: DEFAULT_USER_KEY }];
        }

        if (!sanitized[0].key) {
            sanitized[0].key = DEFAULT_USER_KEY;
            seenKeys.add(DEFAULT_USER_KEY.toLowerCase());
        }

        sanitized.forEach(user => {
            if (!user.key) {
                const nextKey = AVAILABLE_USER_KEYS.find(key => !seenKeys.has(key.toLowerCase()));
                if (nextKey) {
                    user.key = nextKey;
                    seenKeys.add(nextKey.toLowerCase());
                }
            }
        });

        return sanitized;
    }

    getAssignedKeys(options = {}) {
        const excludeName = options.excludeName ? String(options.excludeName) : null;
        return this.state.users
            .filter(user => user && user.key && user.name !== excludeName)
            .map(user => user.key);
    }

    getAvailableKeys(currentKey, excludeName) {
        const assigned = this.getAssignedKeys({ excludeName });
        return AVAILABLE_USER_KEYS.filter(key => key === currentKey || !assigned.includes(key));
    }

    getNextAvailableKey(users = this.state.users) {
        const assigned = (users || []).filter(Boolean).map(user => user.key).filter(Boolean);
        return AVAILABLE_USER_KEYS.find(key => !assigned.includes(key)) || '';
    }

    getUserByKey(key) {
        const normalized = (key || '').toLowerCase();
        if (!normalized) return null;
        return this.state.users.find(user => (user.key || '').toLowerCase() === normalized) || null;
    }

    isEventFromTextInput(event) {
        if (!event || !event.target) return false;
        const target = event.target;
        if (target.isContentEditable) return true;
        const tagName = target.tagName ? target.tagName.toLowerCase() : '';
        return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    }

    handleGlobalKeyDown(event) {
        if (!event || event.repeat) return;
        if (this.state.interactionMode !== 'pushToTalk') return;
        if (this.isEventFromTextInput(event)) return;
        const matchedUser = this.getUserByKey(event.key);
        if (!matchedUser) return;
        if (this.activeUserKey && this.activeUserKey !== matchedUser.key) return;
        if (this.state.isListening || this.state.isMicLoading || this.state.isProcessingAudio) return;

        this.activeUserKey = matchedUser.key;
        event.preventDefault();

        const startForUser = () => {
            if (!this.isComponentMounted) return;
            this.startRecording();
        };

        if (this.state.currentUser !== matchedUser.name) {
            this.setState({ currentUser: matchedUser.name }, startForUser);
        } else {
            startForUser();
        }
    }

    handleGlobalKeyUp(event) {
        if (!event) return;
        if (this.state.interactionMode !== 'pushToTalk') return;
        if (!this.activeUserKey) return;

        const eventKey = (event.key || '').toLowerCase();
        if (!eventKey || eventKey !== this.activeUserKey.toLowerCase()) {
            return;
        }

        event.preventDefault();
        this.activeUserKey = null;
        this.stopRecording();
    }

    handleWindowBlur() {
        if (!this.activeUserKey) return;
        this.activeUserKey = null;
        this.stopRecording();
    }


    toggleSettingsPanel() {
        this.setState(prev => ({ isSettingsOpen: !prev.isSettingsOpen }));
    }

    handleAddUser(name, key) {
        const trimmed = (name || '').trim();
        const normalizedKey = (key || '').trim();
        if (!trimmed || !normalizedKey) return;
        this.setState(prev => {
            const nameAlreadyExists = prev.users.some(user => user.name === trimmed);
            const keyInUse = prev.users.some(user => (user.key || '').toLowerCase() === normalizedKey.toLowerCase());
            if (nameAlreadyExists || keyInUse) {
                return null;
            }
            const nextUsers = [...prev.users, { name: trimmed, key: normalizedKey }];
            return {
                users: nextUsers,
                newUserName: '',
                newUserKey: this.getNextAvailableKey(nextUsers)
            };
        });
    }
    handleRemoveUser(name) {
        this.setState(prev => {
            if (prev.users.length === 1) return null; // keep at least one
            const nextUsers = prev.users.filter(user => user.name !== name);
            if (nextUsers.length === prev.users.length) return null;
            const nextCurrentUser = nextUsers.some(user => user.name === prev.currentUser)
                ? prev.currentUser
                : (nextUsers[0] ? nextUsers[0].name : '');
            const nextEditing = { ...prev.editingUser };
            delete nextEditing[name];
            return {
                users: nextUsers,
                currentUser: nextCurrentUser,
                newUserKey: this.getNextAvailableKey(nextUsers),
                editingUser: nextEditing
            };
        });
    }
    handleUpdateUser(oldName) {
        this.setState(prev => {
            const pendingValue = Object.prototype.hasOwnProperty.call(prev.editingUser, oldName)
                ? prev.editingUser[oldName]
                : oldName;
            const trimmed = (pendingValue || '').trim();
            const nextEditing = { ...prev.editingUser };
            delete nextEditing[oldName];
            if (!trimmed || trimmed === oldName) {
                return { editingUser: nextEditing };
            }
            const nameAlreadyExists = prev.users.some(user => user.name === trimmed && user.name !== oldName);
            if (nameAlreadyExists) {
                return { editingUser: nextEditing };
            }
            const nextUsers = prev.users.map(user =>
                user.name === oldName ? { ...user, name: trimmed } : user
            );
            const nextCurrent = prev.currentUser === oldName ? trimmed : prev.currentUser;
            const nextTranscript = prev.transcript.map(entry =>
                entry.sender === 'user' && entry.displayName === oldName
                    ? { ...entry, displayName: trimmed }
                    : entry
            );
            return {
                users: nextUsers,
                currentUser: nextCurrent,
                transcript: nextTranscript,
                editingUser: nextEditing
            };
        });
    }
    handleUpdateUserKey(name, key) {
        const normalizedKey = (key || '').trim();
        if (!normalizedKey) return;
        this.setState(prev => {
            const targetUser = prev.users.find(user => user.name === name);
            if (!targetUser) return null;
            const keyInUse = prev.users.some(user =>
                user.name !== name && (user.key || '').toLowerCase() === normalizedKey.toLowerCase()
            );
            if (keyInUse) {
                return null;
            }
            const nextUsers = prev.users.map(user =>
                user.name === name ? { ...user, key: normalizedKey } : user
            );
            return {
                users: nextUsers,
                newUserKey: this.getNextAvailableKey(nextUsers)
            };
        });
    }
    handleSetCurrentUser(name) {
        if (!name) return;
        const exists = this.state.users.some(user => user.name === name);
        if (!exists) return;
        this.setState({ currentUser: name });
    }

    renderTranscript() {
        const { transcript } = this.state;
        const { intl } = this.props;

        if (!transcript.length) {
            return (
                <div className={styles.transcriptEmpty}>
                    {intl.formatMessage(messages.transcriptEmpty)}
                </div>
            );
        }

        return (
            <ul className={styles.transcriptList}>
                {transcript.map(entry => (
                    <li key={entry.id} className={styles.transcriptItem}>
                        <span className={styles.transcriptSender}>
                            {entry.sender === 'user'
                                ? (entry.displayName || this.props.intl.formatMessage(messages.transcriptLabelUser))
                                : this.props.intl.formatMessage(messages.transcriptLabelMarty)}
                        </span>
                        <span className={styles.transcriptMessage}>{entry.text}</span>
                        <span className={styles.transcriptTimestamp}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </li>
                ))}
            </ul>
        );
    }

    handleEditUser(name, value) {
        this.setState(prev => ({
            editingUser: {
                ...prev.editingUser,
                [name]: value
            }
        }));
    }

    renderUserManagement() {
        const { intl } = this.props;
        const { editingUser, newUserName, newUserKey, users } = this.state;
        const availableKeysForNewUser = this.getAvailableKeys();
        const trimmedNewName = newUserName.trim();
        const canAddUser = Boolean(trimmedNewName && newUserKey);

        return (
            <div className={styles.settingsParticipants}>
                <h3 className={styles.settingsSubheading}>
                    {intl.formatMessage(messages.usersSettingsTitle)}
                    <span className={styles.settingsSubheadingDescription}>
                        {intl.formatMessage(messages.usersSettingsDescription)}
                    </span>
                </h3>
                <ul className={styles.settingsUserList}>
                    {users.map(({ name, key }) => {
                        const pendingName = Object.prototype.hasOwnProperty.call(editingUser, name)
                            ? editingUser[name]
                            : name;
                        const keyOptions = this.getAvailableKeys(key, name);
                        return (
                            <li key={name} className={styles.settingsUserListItem}>
                                <input
                                    type="text"
                                    value={pendingName}
                                    onChange={event => this.handleEditUser(name, event.target.value)}
                                    onBlur={() => this.handleUpdateUser(name)}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            this.handleUpdateUser(name);
                                        }
                                    }}
                                    className={classNames(styles.textInput, styles.settingsUserInput)}
                                />
                                <select
                                    value={key || ''}
                                    onChange={event => this.handleUpdateUserKey(name, event.target.value)}
                                    className={classNames(styles.selectInput, styles.userKeySelect)}
                                >
                                    {keyOptions.map(optionKey => (
                                        <option key={optionKey} value={optionKey}>
                                            {optionKey}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    style={{ visibility: users.length === 1 ? 'hidden' : 'visible' }}
                                    type="button"
                                    className={styles.addRemoveUserButton}
                                    disabled={users.length === 1}
                                    onClick={() => this.handleRemoveUser && this.handleRemoveUser(name)}
                                >
                                    {/* {intl.formatMessage(messages.removeUserButton)}*/}
                                    ➖
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div className={styles.settingsUserAddRow}>
                    <input
                        type="text"
                        placeholder={intl.formatMessage(messages.addUserPlaceholder)}
                        value={newUserName}
                        onChange={event => this.setState({ newUserName: event.target.value })}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                this.handleAddUser(event.target.value, this.state.newUserKey);
                            }
                        }}
                        className={classNames(styles.textInput, styles.settingsUserInput)}
                    />
                    <select
                        value={newUserKey}
                        onChange={event => this.setState({ newUserKey: event.target.value })}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                this.handleAddUser(this.state.newUserName, event.target.value);
                            }
                        }}
                        className={classNames(styles.selectInput, styles.userKeySelect)}
                        disabled={!availableKeysForNewUser.length}
                    >
                        {availableKeysForNewUser.length === 0 && (
                            <option value="">
                                —
                            </option>
                        )}
                        {availableKeysForNewUser.map(optionKey => (
                            <option key={optionKey} value={optionKey}>
                                {optionKey}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={classNames(styles.addRemoveUserButton, styles.addUserButton)}
                        onClick={() => this.handleAddUser(newUserName, newUserKey)}
                        disabled={!canAddUser}
                    >
                        <span aria-hidden="true">➕</span>
                        <span className={styles.addUserButtonLabel}>
                            {intl.formatMessage(messages.addUserButton)}
                        </span>
                    </button>
                </div>
                <p className={styles.settingsUserHint}>
                    {intl.formatMessage(messages.addUserHint)}
                </p>
            </div>
        );
    }

    render() {
        const { intl } = this.props;
        const {
            conversationMode,
            interactionMode,
            isListening,
            isMicLoading,
            isProcessingAudio,
            isSendingText,
            currentMessage,
            llmSettings,
            recordingError,
            lastRecordingUrl,
            messageError,
            isThinking,
            isSpeaking,
            isSettingsOpen,
            users,
            currentUser,
            recordingStatus
        } = this.state;

        const isBusy = isThinking || isSpeaking;

        const conversationDescription = conversationMode === 'conversation'
            ? intl.formatMessage(messages.conversationModeConversationDescription)
            : intl.formatMessage(messages.conversationModeQADescription);

        const interactionDescription = interactionMode === 'pushToTalk'
            ? intl.formatMessage(messages.interactionModePushToTalkDescription)
            : intl.formatMessage(messages.interactionModeWakeWordsDescription);

        return (
            <>
                {/* busy overlay remains */}
                {isBusy && (
                    <div
                        className={styles.activityBackdrop || ''}
                        aria-label={intl.formatMessage(messages.activityOverlayLabel)}
                        role="dialog"
                        aria-modal="true"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)', // near-invisible but blocks clicks
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            pointerEvents: 'auto'
                        }}
                    >
                        <div
                            className={styles.activityOverlay || ''}
                            style={{
                                position: 'absolute',
                                top: "50%",
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                                pointerEvents: 'none', // ensure no accidental interaction
                                // animation: 'tm-slideDown 300ms ease-out'
                            }}
                        >
                            {isThinking && <LoadingSpinnerMarty />}
                            {isSpeaking && <SpeakingMarty />}
                        </div>
                        {/* <style>
                            {`@keyframes tm-slideDown {
                                from { transform: translateY(-40px); opacity: 0; }
                                to { transform: translateY(50%); opacity: 1; }
                             }`}
                        </style> */}
                    </div>
                )}
                <div
                    className={styles.talkWithMarty}
                    aria-busy={isBusy ? 'true' : 'false'}
                    aria-hidden={isBusy ? 'true' : 'false'}
                    style={isBusy ? { userSelect: 'none' } : undefined}
                >
                    <div className={styles.primarySections}>
                        <section className={styles.section}>
                            <header className={styles.sectionHeader}>
                                <h2>{intl.formatMessage(messages.interactionTypeTitle)}</h2>
                                <p>{conversationDescription}</p>
                            </header>
                            <div className={styles.toggleGroup} role="group" aria-label={intl.formatMessage(messages.interactionTypeTitle)}>
                                <button
                                    type="button"
                                    className={classNames(styles.toggleButton, {
                                        [styles.toggleButtonActive]: conversationMode === 'conversation'
                                    })}
                                    aria-pressed={conversationMode === 'conversation'}
                                    onClick={() => this.handleConversationModeChange('conversation')}
                                >
                                    {intl.formatMessage(messages.conversationModeConversation)}
                                </button>
                                {/* <button
                                    type="button"
                                    className={classNames(styles.toggleButton, {
                                        [styles.toggleButtonActive]: conversationMode === 'qa'
                                    })}
                                    aria-pressed={conversationMode === 'qa'}
                                    onClick={() => this.handleConversationModeChange('qa')}
                                >
                                    {intl.formatMessage(messages.conversationModeQA)}
                                </button> */}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <header className={styles.sectionHeader}>
                                <h2>{intl.formatMessage(messages.interactionParametersTitle)}</h2>
                                <p>{interactionDescription}</p>
                            </header>
                            <div className={styles.toggleGroup} role="group" aria-label={intl.formatMessage(messages.interactionParametersTitle)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {/* <button
                                        type="button"
                                        className={classNames(styles.toggleButton, {
                                            [styles.toggleButtonActive]: interactionMode === 'pushToTalk'
                                        })}
                                        aria-pressed={interactionMode === 'pushToTalk'}
                                        onClick={() => this.handleInteractionModeChange('pushToTalk')}
                                        onPointerDown={() => this.handleToggleListening()}
                                        onPointerUp={() => this.handleToggleListening()}
                                    >
                                        {intl.formatMessage(messages.interactionModePushToTalk)}
                                    </button> */}
                                    {this.renderUserManagement()}
                                </div>
                                {/* <button
                                    type="button"
                                    className={classNames(styles.toggleButton, {
                                        [styles.toggleButtonActive]: interactionMode === 'wakeWords'
                                    })}
                                    aria-pressed={interactionMode === 'wakeWords'}
                                    onClick={() => this.handleInteractionModeChange('wakeWords')}
                                >
                                    {intl.formatMessage(messages.interactionModeWakeWords)}
                                </button> */}
                            </div>

                            {/* {interactionMode === 'pushToTalk' && (
                                <>
                                    <button
                                        type="button"
                                        className={classNames(styles.primaryButton, {
                                            [styles.primaryButtonActive]: isListening
                                        })}
                                        onClick={this.handleToggleListening}
                                        disabled={isMicLoading || isProcessingAudio || !this.mediaSupportAvailable}
                                    >
                                        {intl.formatMessage(isListening ? messages.listeningStop : messages.listeningStart)}
                                    </button>
                                </>
                            )} */}

                            {interactionMode === 'wakeWords' && (
                                <div className={styles.wakeWordsHint}>
                                    {intl.formatMessage(messages.wakeWordHint)}
                                </div>
                            )}

                            {interactionMode === 'pushToTalk' && recordingStatus === 'preparing' && (
                                <div className={styles.preparingIndicator}>
                                    <RecordingPreparationProgress
                                        className={styles.preparingIndicatorCircle}
                                        durationMs={PREPARING_PROGRESS_DURATION_MS}
                                        size={60}
                                        strokeWidth={8}
                                    />
                                    <span>{intl.formatMessage(messages.recordingPreparingIndicator)}</span>
                                </div>
                            )}
                            {interactionMode === 'pushToTalk' && recordingStatus === 'recording' && (
                                <div className={styles.recordingIndicator}>
                                    {intl.formatMessage(messages.recordingIndicator)}
                                </div>
                            )}
                            {interactionMode === 'pushToTalk' && isThinking && recordingStatus === 'idle' && (
                                <div className={styles.processingIndicator}>
                                    {intl.formatMessage(messages.thinkingIndicator)}
                                </div>
                            )}
                            {interactionMode === 'pushToTalk' && this.state.isSpeaking && recordingStatus === 'idle' && (
                                <div className={styles.processingIndicator}>
                                    {intl.formatMessage(messages.speakingIndicator)}
                                </div>
                            )}
                            {interactionMode === 'pushToTalk' && isProcessingAudio && (
                                <div className={styles.processingIndicator}>
                                    {intl.formatMessage(messages.processingRecording)}
                                </div>
                            )}

                            {interactionMode === 'pushToTalk' && !this.mediaSupportAvailable && (
                                <div className={styles.recordingError}>
                                    {intl.formatMessage(messages.recordingUnsupported)}
                                </div>
                            )}

                            {interactionMode === 'pushToTalk' && recordingError && this.mediaSupportAvailable && (
                                <div className={styles.recordingError}>{recordingError}</div>
                            )}

                            {interactionMode === 'pushToTalk' && (
                                <div className={styles.recordingCue}>
                                    {intl.formatMessage(messages.recordingStartCue)}
                                </div>
                            )}

                            {/* {interactionMode === 'pushToTalk' && lastRecordingUrl && !isListening && !isProcessingAudio && (
                                <div className={styles.recordingPlayback}>
                                    <span className={styles.inputLabel}>{intl.formatMessage(messages.lastRecordingLabel)}</span>
                                    <audio controls src={lastRecordingUrl} className={styles.audioPlayer} />
                                </div>
                            )} */}

                        </section>
                    </div>

                    <section className={classNames(styles.section, styles.headerSection)}>
                        <TalkWithMartySettingsPanel
                            isOpen={isSettingsOpen}
                            onToggle={this.toggleSettingsPanel}
                            settings={llmSettings}
                            onSettingChange={this.handleSettingsChange}
                            availableModels={AVAILABLE_LLM_MODELS}
                        />
                    </section>

                    <section className={classNames(styles.section, styles.transcriptSection)}>
                        <header className={styles.sectionHeader}>
                            <h2>{intl.formatMessage(messages.transcriptTitle)}</h2>
                            <div className={styles.headerActions}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={this.handleDownloadTranscript}
                                    disabled={!this.state.transcript.length}
                                >
                                    {intl.formatMessage(messages.transcriptDownload)}
                                </button>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={this.handleClearTranscript}
                                    disabled={!this.state.transcript.length}
                                >
                                    {intl.formatMessage(messages.transcriptClear)}
                                </button>
                            </div>
                        </header>
                        <div
                            className={styles.transcriptContainer}
                            ref={this.transcriptContainerRef}
                        >
                            {this.renderTranscript()}
                        </div>

                        <form className={styles.messageComposer} onSubmit={this.handleSendMessage}>
                            <label className={styles.inputLabel} htmlFor="talk-with-marty-message">
                                {intl.formatMessage(messages.sendMessageLabel)}
                            </label>
                            <textarea
                                id="talk-with-marty-message"
                                className={styles.messageInput}
                                value={currentMessage}
                                onChange={this.handleMessageChange}
                                placeholder={intl.formatMessage(messages.sendMessagePlaceholder)}
                                rows={3}
                            />
                            {messageError && (
                                <div className={styles.messageError}>{messageError}</div>
                            )}
                            {interactionMode === 'pushToTalk' && (
                                <select
                                    className={styles.selectInput}
                                    value={currentUser}
                                    aria-label={intl.formatMessage(messages.currentSpeakerLabel)}
                                    onChange={e => this.handleSetCurrentUser(e.target.value)}
                                    style={{ minHeight: '32px' }}
                                >
                                    {users.map(user => (
                                        <option key={user.name} value={user.name}>
                                            {user.name}{user.key ? ` (${user.key})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div className={styles.composerActions}>
                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={!currentMessage.trim() || isSendingText}
                                >
                                    {intl.formatMessage(messages.sendMessageButton)}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>
            </>
        );
    }
}

TalkWithMarty.propTypes = {
    intl: intlShape,
    onAudioCaptured: PropTypes.func,
    activityImageSrc: PropTypes.string
};

export default injectIntl(TalkWithMarty);

function getRaftUsingTargetId(targetId) {
    if (!window.raftManager || !window.applicationManager || !window.applicationManager.connectedRafts) {
        return null;
    }
    const raftId = window.raftManager.raftIdAndDeviceIdMap[targetId];
    const raft = window.applicationManager.connectedRafts[raftId];
    return raft;
}

const getConnectedRaft = () => {
    const targetId = window.vm && window.vm.runtime && window.vm.runtime._editingTarget.id;
    if (!targetId) {
        console.warn('[TalkWithMarty] Unable to stream audio to Marty: target ID not found');
        return;
    }
    const connectedRaft = getRaftUsingTargetId(targetId);
    if (!connectedRaft) {
        console.warn('[TalkWithMarty] Unable to stream audio to Marty: raft connection not found');
        return;
    }
    return connectedRaft;
}
const martyIsListening = () => {
    const connectedRaft = getConnectedRaft();
    if (!connectedRaft) {
        return;
    }
    connectedRaft.sendRestMessage('led/LEDeye/pattern/pinwheel?c=ff0000');
}

const martyIsThinking = () => {
    const connectedRaft = getConnectedRaft();
    if (!connectedRaft) {
        return;
    }
    connectedRaft.sendRestMessage('led/LEDeye/pattern/pinwheel?c=00ff00');
    connectedRaft.sendRestMessage('traj/getReady/?moveTime=2000');
}

const martyStartsTalking = () => {
    const connectedRaft = getConnectedRaft();
    if (!connectedRaft) {
        return;
    }
    connectedRaft.sendRestMessage('led/LEDeye/pattern/show-off');
}

const martyStopsTalking = () => {
    const connectedRaft = getConnectedRaft();
    if (!connectedRaft) {
        return;
    }
    connectedRaft.sendRestMessage('led/LEDeye/off');
}
