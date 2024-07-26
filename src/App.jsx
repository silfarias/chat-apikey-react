import { useState, useEffect, useRef } from 'react';
import { guardarMensajes } from './utils/messages.js';
import { BsRobot } from "react-icons/bs";
import axios from 'axios';
import './css/index.css';


const apiKey = import.meta.env.VITE_API_KEY;

function App() {

  const [question, setQuestion] = useState(''); // estado de la pregunta
  const [answer, setAnswer] = useState(''); // estado de la respuesta

  // estado para los mensajes, verifica si hay mensajes guardados en el localStorage
  // si no hay, los inicializa como un arreglo vacío
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem('messages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  });

  const messagesEndRef = useRef(null); // referencia al elemento HTML para hacer scroll hacia abajo

  // actualiza el localStorage con los nuevos mensajes
  useEffect(() => {
    guardarMensajes(messages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // hace un scroll suave hacia abajo
  };

  async function generateAnswer() {

    if (question === '') return // si la pregunta del usuario esta vacia, no hace nada

    // agrega el mensaje del usuario al estado
    const newMessages = [...messages, { type: 'user', text: question }];
    setMessages(newMessages);
    setQuestion('');
    setAnswer('loading...');

    try {

      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        method: 'post',
        data: {
          "contents": [
            { "parts": [{ "text": question }] }
          ]
        }
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text; // extraemos el texto de la respuesta
      setAnswer(aiResponse);
      setMessages([...newMessages, { type: 'ai', text: aiResponse }]);

    } catch (error) {
      setAnswer('Error fetching response.');
      setMessages([...newMessages, { type: 'ai', text: 'Error fetching response.' }]);
    }
  }

  return (
    <div className='main-chat'>
      <div className='title'>
        <BsRobot size={50} color='white' />
        <h1>Chat IA Gemini</h1>
      </div>

      <div className='chat'>
        <div className='mensajes'>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* referencia al elemento HTML para hacer scroll hacia abajo */}
        </div>

        <div className='input-container'>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe tu pregunta..."
            onKeyUpCapture={(e) => e.key === 'Enter' && generateAnswer()}
          />
          <button onClick={generateAnswer}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default App;