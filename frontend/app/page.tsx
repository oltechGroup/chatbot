//frontend/app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { SendHorizonal, BotMessageSquare, User, MoreHorizontal, ChevronRight, FileDown, FileText, Download, MessageCircle, CalendarClock, PhoneCall, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotService } from './services/api';

type Message = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  isOptions?: boolean;
  optionsType?: 'categorias' | 'subcategorias' | 'tipoContacto' | 'explorarMas' | 'feedbackOpcion';
  optionsData?: any[];
  isFileCard?: boolean;
  fileData?: { nombre: string; url?: string };
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: '¡Hola! Bienvenido al asistente virtual de OMMA Group. 👋 ¿Cómo te llamas?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [step, setStep] = useState(0); 
  const [visitanteId, setVisitanteId] = useState<number | null>(null);
  
  const [tipoContactoSeleccionado, setTipoContactoSeleccionado] = useState<'telefono' | 'email' | null>(null);
  
  // NUEVO: Memoria para saber si tenemos cómo contactarlo
  const [tieneDatosContacto, setTieneDatosContacto] = useState<boolean>(false);
  // NUEVO: Memoria para guardar la solicitud pendiente mientras pedimos el contacto
  const [solicitudPendiente, setSolicitudPendiente] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchCategorias = async () => {
    setIsTyping(true);
    setStep(6); 
    try {
      const categoriasBd = await chatbotService.obtenerCategorias();
      
      const opcionesEspeciales = [
        { id: 'AGENDAR_TALLER', nombre: 'Agendar para un taller', isEspecial: true, icon: CalendarPlus },
        { id: 'AGENDAR_CITA', nombre: 'Agendar una cita', isEspecial: true, icon: CalendarClock },
        { id: 'SOPORTE_TELEFONICO', nombre: 'Soporte telefónico', isEspecial: true, icon: PhoneCall }
      ];

      const menuCompleto = [...categoriasBd, ...opcionesEspeciales];

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          sender: 'bot', 
          text: '¿Qué área de especialidad te gustaría explorar hoy, o necesitas atención personalizada?',
          isOptions: true,
          optionsType: 'categorias',
          optionsData: menuCompleto
        }]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue.trim();
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (step === 0) {
        const response = await chatbotService.registrarNombre(userText);
        setVisitanteId(response.visitante.id);
        setStep(1);
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡Mucho gusto, ${userText}! Para completar tu registro, ¿de qué país nos visitas?` }]);
          setIsTyping(false);
        }, 1000);
      } else if (step === 1) {
        if (visitanteId) await chatbotService.actualizarDatos(visitanteId, { pais: userText });
        setStep(2);
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Gracias. ¿Podrías indicarnos tu Código Postal? (Escribe "No" si lo prefieres)` }]);
          setIsTyping(false);
        }, 1000);
      } else if (step === 2) {
        if (userText.toLowerCase().includes('no')) {
          setStep(3);
          setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `No te preocupes, ¿en qué ciudad resides?` }]);
            setIsTyping(false);
          }, 1000);
        } else {
          if (visitanteId) await chatbotService.actualizarDatos(visitanteId, { codigo_postal: userText });
          setStep(4);
          preguntaContacto();
        }
      } else if (step === 3) {
        if (visitanteId) await chatbotService.actualizarDatos(visitanteId, { ciudad: userText });
        setStep(4);
        preguntaContacto();
      } else if (step === 5) {
        if (visitanteId && tipoContactoSeleccionado) {
          if (tipoContactoSeleccionado === 'email') {
            await chatbotService.actualizarDatos(visitanteId, { email: userText });
          } else {
            await chatbotService.actualizarDatos(visitanteId, { telefono: userText });
          }
          // Acaba de darnos sus datos, prendemos la bandera verde
          setTieneDatosContacto(true); 
        }
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡Registro completado exitosamente! 🎉` }]);
          fetchCategorias();
        }, 1000);
      } 
      
      // NUEVO PASO INTERMEDIO: Si le pedimos el dato a la fuerza porque quería una asesoría
      else if (step === 99 && solicitudPendiente) {
        // Asumimos que lo que escribió es un correo si tiene '@', si no, es teléfono
        const datoEnviado = userText.includes('@') ? { email: userText } : { telefono: userText };
        
        if (visitanteId) {
          await chatbotService.actualizarDatos(visitanteId, datoEnviado);
          await chatbotService.registrarInteraccion(visitanteId, null as any, solicitudPendiente.id);
        }
        
        setTieneDatosContacto(true);
        setStep(8); // Lo mandamos a la pregunta de "Explorar Más"
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            sender: 'bot', 
            text: `¡Perfecto, ya lo tengo guardado! ✅ En breve, uno de nuestros especialistas te contactará para coordinar tu **${solicitudPendiente.nombre.toLowerCase()}**.` 
          }]);
          
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              sender: 'bot', 
              text: `Mientras tanto, ¿te gustaría explorar nuestra área de productos?`,
              isOptions: true,
              optionsType: 'explorarMas',
              optionsData: [{ id: 'si', nombre: 'Sí, explorar productos' }, { id: 'no', nombre: 'No por el momento' }]
            }]);
            setIsTyping(false);
          }, 2000);
        }, 1000);
      }

      else if (step === 10) {
        if (visitanteId) await chatbotService.actualizarDatos(visitanteId, { comentario: userText });
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡Muchas gracias por tus comentarios! Nos ayudan a mejorar. ¡Que tengas un excelente día!` }]);
          setStep(11);
          setIsTyping(false);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Hubo un error de conexión.` }]);
      setIsTyping(false);
    }
  };

  const preguntaContacto = () => {
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'bot', 
        text: `¡Casi listos! Nos gustaría mantenerte al día. ¿Cómo prefieres que te contactemos?`,
        isOptions: true,
        optionsType: 'tipoContacto',
        optionsData: [
          { id: 'whatsapp', nombre: 'Número de WhatsApp / Teléfono' },
          { id: 'correo', nombre: 'Correo Electrónico' },
          { id: 'ninguno', nombre: 'Ninguno por ahora' }
        ]
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = async (tipo: string, data: any) => {
    
    if (tipo === 'categorias') {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.nombre }]);
      setIsTyping(true);
      
      if (data.isEspecial) {
        
        // --- FILTRO DE SEGURIDAD VIP ---
        if (!tieneDatosContacto) {
          // No tiene datos, hacemos el desvío inteligente
          setSolicitudPendiente(data); // Guardamos lo que quería en la memoria
          setStep(99); // Estado de rescate de contacto
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              sender: 'bot', 
              text: `Me encantaría agendar esto para ti, pero veo que no me dejaste un medio de contacto. 😅 ¿Me podrías proporcionar tu número de teléfono  aquí abajo?` 
            }]);
            setIsTyping(false);
          }, 1000);
          return; // Detenemos la ejecución aquí
        }

        // Si SÍ tiene datos, sigue el flujo normal
        setStep(8); 
        try {
          if (visitanteId) {
             await chatbotService.registrarInteraccion(visitanteId, null as any, data.id);
          }
          
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              sender: 'bot', 
              text: `✅ ¡Solicitud recibida! En breve, uno de nuestros especialistas se pondrá en contacto contigo para coordinar tu petición de **${data.nombre.toLowerCase()}**.` 
            }]);
            
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                id: Date.now(), 
                sender: 'bot', 
                text: `Mientras tanto, ¿te gustaría explorar nuestra área de productos?`,
                isOptions: true,
                optionsType: 'explorarMas',
                optionsData: [{ id: 'si', nombre: 'Sí, explorar productos' }, { id: 'no', nombre: 'No por el momento' }]
              }]);
              setIsTyping(false);
            }, 2000);
          }, 1000);
        } catch (error) {
          console.error(error);
          setIsTyping(false);
        }
      } 
      else {
        setStep(7); 
        try {
          const subcategorias = await chatbotService.obtenerSubcategorias(data.id);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              sender: 'bot', 
              text: `Soluciones para **${data.nombre}**. Selecciona el catálogo que deseas descargar:`,
              isOptions: true,
              optionsType: 'subcategorias',
              optionsData: subcategorias
            }]);
            setIsTyping(false);
          }, 1000);
        } catch (error) {
          console.error(error);
          setIsTyping(false);
        }
      }
    } 
    
    else if (tipo === 'subcategorias') {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: `Descargar: ${data.nombre}` }]);
      setIsTyping(true);
      setStep(8); 
      try {
        if (visitanteId) await chatbotService.registrarInteraccion(visitanteId, data.id, 'DESCARGA_CATALOGO');
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡Excelente elección! Haz clic en el documento para descargarlo:` }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              sender: 'bot', 
              text: '', 
              isFileCard: true, 
              fileData: { nombre: data.nombre, url: data.url_catalogo } 
            }]);
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                id: Date.now(), 
                sender: 'bot', 
                text: `¿Te gustaría explorar alguna otra área de especialidad?`,
                isOptions: true,
                optionsType: 'explorarMas',
                optionsData: [{ id: 'si', nombre: 'Sí, explorar más' }, { id: 'no', nombre: 'No por el momento' }]
              }]);
              setIsTyping(false);
            }, 1500);
          }, 800);
        }, 1000);
      } catch (error) {
        console.error(error);
        setIsTyping(false);
      }
    }

    else if (tipo === 'tipoContacto') {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.nombre }]);
      setIsTyping(true);
      
      setTimeout(() => {
        if (data.id === 'ninguno') {
          // NO prendemos la bandera aquí porque eligió "Ninguno"
          setStep(6);
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡Entendido! Registro completado exitosamente. 🎉` }]);
          fetchCategorias();
        } else {
          setStep(5);
          setTipoContactoSeleccionado(data.id === 'correo' ? 'email' : 'telefono');
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Por favor, ingresa tu ${data.nombre.toLowerCase()} aquí:` }]);
          setIsTyping(false);
        }
      }, 1000);
    }

    else if (tipo === 'explorarMas') {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.nombre }]);
      setIsTyping(true);
      
      if (data.id === 'si') {
        fetchCategorias();
      } else {
        setStep(9);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            sender: 'bot', 
            text: `Antes de irte, ¿te gustaría dejarnos un comentario general sobre tu experiencia con nosotros?`,
            isOptions: true,
            optionsType: 'feedbackOpcion',
            optionsData: [{ id: 'si', nombre: 'Sí, dejar comentario' }, { id: 'no', nombre: 'No, gracias' }]
          }]);
          setIsTyping(false);
        }, 1000);
      }
    }

    else if (tipo === 'feedbackOpcion') {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.nombre }]);
      setIsTyping(true);

      setTimeout(() => {
        if (data.id === 'si') {
          setStep(10);
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Por favor, escribe tu comentario general aquí:` }]);
        } else {
          setStep(11);
          setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `¡De acuerdo! Muchas gracias por visitarnos en el congreso. ¡Que tengas un excelente día!` }]);
        }
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Bloqueamos el input en menús, cuando terminó, O cuando está mostrando el mensaje de rescate de contacto (el usuario tiene que escribir ahí)
  const isInputDisabled = isTyping || [4, 6, 7, 8, 9, 11].includes(step);

  return (
    <main className="flex min-h-screen flex-col bg-[#F8FAFC] text-gray-900 font-sans relative">
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 z-50 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="relative w-[200px] h-[60px] md:w-[250px] md:h-[70px]">
          <Image src="/images/logo_omma.png" alt="OMMA Group Logo" fill priority sizes="(max-width: 768px) 200px, 250px" className="object-contain object-left" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#0B162C]/80">En línea</span>
        </div>
      </header>

      <section className="flex-grow pt-[85px] md:pt-28 pb-0 md:pb-8 px-0 md:px-4 flex flex-col items-center">
        <div className="w-full md:max-w-3xl bg-white md:shadow-2xl md:rounded-[2rem] border-t md:border border-gray-200 flex flex-col h-[calc(100vh-85px)] md:h-[75vh] overflow-hidden">
          
          <div className="flex-grow p-4 md:p-8 space-y-6 overflow-y-auto bg-slate-50/50 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {msg.isFileCard ? (
                    <div className="flex items-end gap-3 flex-row ml-11">
                      <a 
                        href={msg.fileData?.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-4 w-[260px] shadow-sm hover:shadow-md transition-shadow cursor-pointer no-underline group"
                      >
                        <div className="bg-red-50 text-red-500 p-2.5 rounded-lg shrink-0">
                          <FileText size={28} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[13px] font-bold text-[#0B162C] truncate leading-tight group-hover:text-[#1E3A5F] transition-colors">{msg.fileData?.nombre}</p>
                          <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold tracking-wider">Documento PDF</p>
                        </div>
                        <div className="text-gray-300 group-hover:text-[#0B162C] transition-colors">
                          <Download size={22} />
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md shrink-0 mb-1 ${msg.sender === 'bot' ? 'bg-[#0B162C] text-white' : 'bg-gray-200 text-[#0B162C]'}`}>
                        {msg.sender === 'bot' ? <BotMessageSquare size={16} /> : <User size={16} />}
                      </div>
                      <div className={`p-4 md:p-5 rounded-2xl text-[15px] leading-relaxed max-w-[85%] md:max-w-[75%] shadow-sm ${msg.sender === 'bot' ? 'bg-white text-[#0B162C] border border-gray-200 rounded-bl-sm' : 'bg-[#0B162C] text-white rounded-br-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  )}

                  {/* IMPORTANTE: Los botones se ocultan si el bot está haciendo una pregunta forzada (step 99) */}
                  {msg.isOptions && msg.optionsData && step !== 99 && (
                    <div className="ml-11 mt-2 flex flex-col gap-2 w-[85%] md:w-[60%]">
                      {msg.optionsData.map((opt: any) => {
                        const IconComponent = opt.icon ? opt.icon : (msg.optionsType === 'categorias' ? ChevronRight : FileDown);
                        
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionClick(msg.optionsType!, opt)}
                            className={`flex items-center justify-between w-full p-3 md:p-4 bg-white border rounded-xl transition-all shadow-sm text-sm md:text-base text-left group
                              ${opt.isEspecial ? 'border-blue-200 text-blue-700 bg-blue-50/30 hover:bg-blue-600 hover:text-white hover:border-transparent' : 
                                ['feedbackOpcion', 'explorarMas', 'tipoContacto'].includes(msg.optionsType!) 
                                ? 'border-[#0B162C]/20 text-[#0B162C] hover:bg-slate-100' 
                                : 'border-[#0B162C]/20 hover:bg-[#0B162C] hover:text-white text-[#0B162C]'
                              }`}
                          >
                            <span className="font-semibold">{opt.nombre}</span>
                            <IconComponent size={18} className={`${opt.isEspecial ? 'text-blue-500 group-hover:text-white' : 'text-[#0B162C]/50 group-hover:text-white'} transition-colors`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0B162C] flex items-center justify-center text-white shadow-md shrink-0 mb-1">
                    <BotMessageSquare size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 rounded-bl-sm text-[#0B162C] shadow-sm flex items-center h-[52px]">
                    <MoreHorizontal className="animate-pulse" size={24} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white z-10 flex flex-col">
            
            {step >= 6 && (
              <div className="bg-green-50 border-y border-green-100 py-2.5 px-4 flex items-center justify-between">
                <span className="text-[11px] md:text-xs text-green-800 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageCircle size={14} /> ¿Necesitas ayuda humana?
                </span>
                <a 
                  href="https://wa.me/5215646160018" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-xs font-bold bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors shadow-sm"
                >
                  Contactar Asesor
                </a>
              </div>
            )}

            <div className="p-4 border-t border-gray-100">
              <div className={`flex items-center gap-3 p-1.5 rounded-full border transition-all shadow-inner 
                ${isInputDisabled ? 'bg-gray-50 border-transparent' : 'bg-slate-100 border-transparent focus-within:border-[#0B162C] focus-within:bg-white'}`}>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isInputDisabled}
                  placeholder={isInputDisabled ? (step === 11 ? "Conversación finalizada" : "Selecciona una opción arriba...") : "Escribe tu respuesta aquí..."} 
                  className="flex-grow bg-transparent px-4 py-2.5 text-sm md:text-base text-[#0B162C] placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isInputDisabled}
                  className="w-11 h-11 rounded-full bg-[#0B162C] flex items-center justify-center text-white hover:bg-[#1E3A5F] shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:active:scale-100"
                >
                  <SendHorizonal size={20} />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-wide">
                OMMA Group Assist &copy; 2026 - Soluciones Quirúrgicas Premium
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}