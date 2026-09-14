// frontend/js/store.js
class Store {
    constructor() {
        this.state = {
            currentUser: null,
            isPremium: false,
            tests: [],
            results: [],
            currentTestId: null,
            currentTestQuestions: [],
            currentAnswers: [],
            currentQuestionIndex: 0,
            isLoading: false,
            error: null,
            view: 'dashboard' // dashboard | test | result
        };
        this.observers = [];
    }

    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(cb => cb !== callback);
        };
    }

    notify() {
        this.observers.forEach(callback => callback(this.state));
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    setUser(user, isPremium) {
        this.setState({ currentUser: user, isPremium });
    }

    setTests(tests) {
        this.setState({ tests });
    }

    setResults(results) {
        this.setState({ results });
    }

    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    setError(error) {
        this.setState({ error });
    }

    setView(view) {
        this.setState({ view });
    }

    setCurrentTest(testId, questions) {
        this.setState({
            currentTestId: testId,
            currentTestQuestions: questions,
            currentAnswers: [],
            currentQuestionIndex: 0,
            view: 'test'
        });
    }

    setAnswer(index, value) {
        const answers = [...this.state.currentAnswers];
        answers[index] = value;
        this.setState({ currentAnswers: answers });
    }

    nextQuestion() {
        const index = this.state.currentQuestionIndex + 1;
        if (index < this.state.currentTestQuestions.length) {
            this.setState({ currentQuestionIndex: index });
        }
    }

    prevQuestion() {
        const index = this.state.currentQuestionIndex - 1;
        if (index >= 0) {
            this.setState({ currentQuestionIndex: index });
        }
    }

    resetTest() {
        this.setState({
            currentTestId: null,
            currentTestQuestions: [],
            currentAnswers: [],
            currentQuestionIndex: 0,
            view: 'dashboard'
        });
    }

    // Getter
    get isPremium() { return this.state.isPremium; }
    get currentUser() { return this.state.currentUser; }
    get tests() { return this.state.tests; }
    get results() { return this.state.results; }
    get isLoading() { return this.state.isLoading; }
    get error() { return this.state.error; }
    get view() { return this.state.view; }
    get currentTestId() { return this.state.currentTestId; }
    get currentTestQuestions() { return this.state.currentTestQuestions; }
    get currentAnswers() { return this.state.currentAnswers; }
    get currentQuestionIndex() { return this.state.currentQuestionIndex; }
    get progress() {
        const total = this.state.currentTestQuestions.length;
        return total > 0 ? ((this.state.currentQuestionIndex + 1) / total) * 100 : 0;
    }
}

export const store = new Store();