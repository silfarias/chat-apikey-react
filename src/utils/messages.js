
export const guardarMensajes = (messages) => {
    localStorage.setItem('messages', JSON.stringify(messages));
}
