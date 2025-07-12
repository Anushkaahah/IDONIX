import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaArrowUp } from 'react-icons/fa';


const InteractiveChatInput = ({ onProjectsGenerated, darkMode }) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [input, setInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [showSentencePrompt, setShowSentencePrompt] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const hasStarted = useRef(false);
  const [replyInProgress, setReplyInProgress] = useState(false);
  const [replyStep, setReplyStep] = useState(0);
  const [conceptTemp, setConceptTemp] = useState('');
  const [domainTemp, setDomainTemp] = useState('');

  const rawUsername = localStorage.getItem('username');
  const username = rawUsername && rawUsername !== 'null' ? rawUsername : 'friend';

  const questions = [
    `Hey buddy! what have you learned today?`,
    'Do you want to add a transcript of what you have learned?',
    'Please paste your transcript below:',
    'What is your skill level?',
    'What is your goal? For what purpose do you want to generate a project? (Optional)'
  ];

  const options = {
    1: ['Yes', 'No'],
    3: ['Beginner', 'Intermediate', 'Advanced'],
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!hasStarted.current && step === 0) {
      hasStarted.current = true;
      setMessages([{ from: 'bot', text: questions[0] }]);
    } else if (step < questions.length && step !== 0) {
      setMessages((prev) => [...prev, { from: 'bot', text: questions[step] }]);
    } else if (step === questions.length) {
      generateProjects(responses);
    }
  }, [step]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages];

    // Typing Yes/No instead of clicking buttons (for step 1 and 3)
    const lowerInput = input.trim().toLowerCase();
    if (!replyInProgress && step in options) {
      const matched = options[step].find(opt => opt.toLowerCase() === lowerInput);
      if (matched) {
        handleOptionClick(matched);
        setInput('');
        return;
      }
    }

    if (replyInProgress) {
      if (replyStep === 0) {
        setConceptTemp(input);
        updatedMessages[updatedMessages.length - 1] = {
          from: 'user',
          text: `I've learned about ${input} under the domain of ${domainTemp || '__________'}`,
        };
        setMessages(updatedMessages);
        setInput('');
        setReplyStep(1);
        return;
      }

      if (replyStep === 1) {
        setDomainTemp(input);
        updatedMessages[updatedMessages.length - 1] = {
          from: 'user',
          text: `I've learned about ${conceptTemp} under the domain of ${input}`,
        };
        setMessages(updatedMessages);

        const updatedResponses = {
          ...responses,
          concept: conceptTemp,
          domain: input,
        };

        setResponses(updatedResponses);
        setInput('');
        setReplyInProgress(false);
        setReplyStep(0);
        setStep(1);
        return;
      }
    } else {
      setMessages((prev) => [...prev, { from: 'user', text: input }]);
      setInput('');
      setStep((prev) => prev + 1);
    }
  };

  const handleOptionClick = (option) => {
    const updatedResponses = { ...responses };
    let nextStep = step + 1;

    setMessages((prev) => [...prev, { from: 'user', text: option }]);

    if (step === 1) {
      updatedResponses.transcriptRequired = option === 'Yes';
      nextStep = option === 'Yes' ? 2 : 3;
    } else if (step === 3) {
      updatedResponses.skill = option;
    }

    setResponses(updatedResponses);
    setStep(nextStep);
  };

  const handleSkip = () => {
    setMessages((prev) => [...prev, { from: 'user', text: '[Skipped Goal]' }]);
    setStep(step + 1);
  };

  const generateProjects = async (data) => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      const response = await axios.post(
        'http://localhost:5000/generate-project',
        {
          concept: data.concept,
          domain: data.domain,
          transcript: data.transcript || '',
          skill_level: data.skill,
          goal: data.goal || '',
          email: email,
        },
        { withCredentials: true }
      );

      if (onProjectsGenerated) {
        onProjectsGenerated(response.data.projects);
      }

      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Here are some projects generated for you!' },
      ]);
    } catch (err) {
      console.error('Error generating projects:', err);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Oops! Something went wrong while generating your projects.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
  // First question logic (Concept and Domain)
  if (step === 0) {
    return replyInProgress
      ? (replyStep === 0 ? 'Enter concept' : 'Enter domain')
      : 'Enter Concept and domain name';
  }

  // For remaining steps
  switch (step) {
    case 1:
      return 'Type Yes or No';
    case 2:
      return 'Paste your transcript here...';
    case 3:
      return 'Beginner / Intermediate / Advanced';
    case 4:
      return 'e.g. Research, Mini Project, Job Prep...';
    default:
      return 'Type your response here...';
  }
};

  return (
    <div className={`w-full max-w-4xl backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] p-6 ${darkMode ? 'bg-white/10 text-white' : 'bg-white/30 text-black'} transition-all`}>
      <div className="text-2xl font-semibold font-mono text-center mb-4 tracking-wide">
         Turn learning into action
      </div>

      <div className="h-72 overflow-y-auto px-2 rounded-xl border border-white/10 p-4 flex flex-col custom-scrollbar space-y-3 bg-white/5 backdrop-blur-md">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              msg.from === 'bot'
                ? 'bg-[#674188] border border-[#FFDFEF] text-white self-start animate-fadeInLeft'
                : 'bg-[#FFDFEF] text-black border border-[#674188] backdrop-blur-md self-end animate-fadeInRight shadow-md'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {step === 0 && !replyInProgress && (
          <button
            onClick={() => {
              setReplyInProgress(true);
              setReplyStep(0);
              setMessages((prev) => [
                ...prev,
                {
                  from: 'user',
                  text: `I've learned about __________ under the domain of __________`,
                },
              ]);
            }}
            className="self-start bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
          >
            Reply
          </button>
        )}

        {loading && (
          <div className="text-sm text-yellow-300 bg-yellow-900/30 rounded-xl px-4 py-2 self-start animate-pulse">
            Generating project ideas...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 space-y-3">
        {(replyInProgress || step < questions.length) && (
          <div className="flex gap-3 items-center">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-transparent text-white placeholder-white/50"
placeholder={getPlaceholder()}
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                if (replyInProgress) {
                  const updatedMessages = [...messages];
                  const lastIndex = updatedMessages.length - 1;
                  if (replyStep === 0) {
                    setConceptTemp(val);
                    updatedMessages[lastIndex].text = `I've learned about ${val} under the domain of ${domainTemp || '__________'}`;
                  } else {
                    setDomainTemp(val);
                    updatedMessages[lastIndex].text = `I've learned about ${conceptTemp || '__________'} under the domain of ${val}`;
                  }
                  setMessages(updatedMessages);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              className="p-3 bg-white hover:bg-[#AD49E1] text-black rounded-full font-bold transition-all text-lg"
            >
             <FaArrowUp className="text-xl" />
            </button>
          </div>
        )}

        {options[step] && !replyInProgress && (
          <div className="flex gap-3 flex-wrap">
            {options[step].map((opt) => (
              <button
                key={opt}
                onClick={() => handleOptionClick(opt)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full transition-all shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step === 4 && !replyInProgress && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-white/20 bg-transparent text-white placeholder-white/60"
              placeholder="e.g. Research, Mini Project, etc."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Submit
              </button>
              <button
                onClick={handleSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveChatInput;
