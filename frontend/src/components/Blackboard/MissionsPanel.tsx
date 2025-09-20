import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Target, Brain, ChevronDown, ChevronUp, Hand, Eye, Mic, Calculator, Bot, MessageCircle, Heart, Globe } from "lucide-react";

// Definición de tipos
interface Model {
  id: string;
  title: string;
  description: string;
  emoji: string;
  imageUrl: string;
  favorite?: boolean;
  features: string[];
}

interface Mission {
  id: number;
  title: string;
  description: string;
  type: string;
  progress: number;
  completed: boolean;
  icon: React.ComponentType<any>;
  reward: string;
  difficulty: string;
}

interface MissionsPanelProps {
  models: Model[];
}

const MissionsPanel: React.FC<MissionsPanelProps> = ({ models }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([
    // Misiones de Modelos de Entrenamiento
    {
      id: 1,
      title: "Entrenar Modelo de Vocales",
      description: "Completa el entrenamiento del modelo de reconocimiento de vocales con 1200 audios",
      type: "training",
      progress: 0,
      completed: false,
      icon: Mic,
      reward: "🎯 +100 XP",
      difficulty: "Fácil"
    },
    {
      id: 2,
      title: "Optimizar Modelo de Abecedario",
      description: "Mejora la precisión del modelo de letras (A-Z + Ñ) al 95%",
      type: "optimization",
      progress: 0,
      completed: false,
      icon: Target,
      reward: "⚡ +150 XP",
      difficulty: "Medio"
    },
    {
      id: 3,
      title: "Implementar Modelo de Palabras",
      description: "Despliega el modelo de reconocimiento de palabras clave con streaming",
      type: "deployment",
      progress: 0,
      completed: false,
      icon: Zap,
      reward: "🚀 +200 XP",
      difficulty: "Difícil"
    },
    {
      id: 4,
      title: "Validar Operaciones Aritméticas",
      description: "Prueba y valida el modelo de operaciones matemáticas básicas",
      type: "validation",
      progress: 0,
      completed: false,
      icon: Calculator,
      reward: "💎 +250 XP",
      difficulty: "Experto"
    },
    
    // Misiones de Cursos de IA
    {
      id: 5,
      title: "Dominar Reconocimiento de Manos",
      description: "Completa el curso de MediaPipe para reconocimiento de gestos",
      type: "course",
      progress: 0,
      completed: false,
      icon: Hand,
      reward: "🤖 +180 XP",
      difficulty: "Medio"
    },
    {
      id: 6,
      title: "Especialista en Reconocimiento Facial",
      description: "Finaliza el curso avanzado de detección y reconocimiento facial",
      type: "course",
      progress: 0,
      completed: false,
      icon: Eye,
      reward: "👁️ +220 XP",
      difficulty: "Difícil"
    },
    {
      id: 7,
      title: "Maestro de Voz con IA",
      description: "Completa el curso especializado en reconocimiento de voz",
      type: "course",
      progress: 0,
      completed: false,
      icon: Mic,
      reward: "🎤 +200 XP",
      difficulty: "Difícil"
    },
    {
      id: 8,
      title: "Operaciones Matemáticas Gestuales",
      description: "Domina las operaciones matemáticas con reconocimiento de manos",
      type: "course",
      progress: 0,
      completed: false,
      icon: Calculator,
      reward: "🧮 +190 XP",
      difficulty: "Medio"
    },
    {
      id: 9,
      title: "Desarrollador de Agente IA",
      description: "Crea tu propio agente de inteligencia artificial avanzado",
      type: "course",
      progress: 0,
      completed: false,
      icon: Bot,
      reward: "🤖 +300 XP",
      difficulty: "Experto"
    },
    {
      id: 10,
      title: "Constructor de Chatbots",
      description: "Desarrolla chatbots automatizados con IA conversacional",
      type: "course",
      progress: 0,
      completed: false,
      icon: MessageCircle,
      reward: "💬 +250 XP",
      difficulty: "Difícil"
    },
    
    // Misiones Futuras (Próximamente)
    {
      id: 11,
      title: "Detector de Emociones",
      description: "Prepárate para el curso de detección de emociones en voz",
      type: "future",
      progress: 0,
      completed: false,
      icon: Heart,
      reward: "❤️ +350 XP",
      difficulty: "Experto"
    },
    {
      id: 12,
      title: "Traductor Universal",
      description: "Anticípate al curso de traducción automática en tiempo real",
      type: "future",
      progress: 0,
      completed: false,
      icon: Globe,
      reward: "🌍 +400 XP",
      difficulty: "Legendario"
    },
    
    // Misiones Maestras
    {
      id: 13,
      title: "Maestro de Modelos",
      description: "Completa todos los entrenamientos de modelos de reconocimiento",
      type: "master",
      progress: 0,
      completed: false,
      icon: Brain,
      reward: "🧠 +500 XP",
      difficulty: "Legendario"
    },
    {
      id: 14,
      title: "Graduado en IA",
      description: "Finaliza todos los cursos disponibles de inteligencia artificial",
      type: "master",
      progress: 0,
      completed: false,
      icon: Trophy,
      reward: "🎓 +800 XP",
      difficulty: "Legendario"
    },
    {
      id: 15,
      title: "Pionero del Blackboard",
      description: "Completa todas las misiones y conviértete en un experto total",
      type: "ultimate",
      progress: 0,
      completed: false,
      icon: Trophy,
      reward: "👑 +1000 XP",
      difficulty: "Legendario"
    }
  ]);

  // Simular progreso de misiones basado en modelos y contenido del blackboard
  useEffect(() => {
    setMissions(prevMissions => 
      prevMissions.map(mission => {
        let newProgress = mission.progress;
        let newCompleted = mission.completed;

        switch (mission.id) {
          // Misiones de Modelos de Entrenamiento
          case 1: // Entrenar Modelo de Vocales
            const vocalModel = models.find(m => m.title.toLowerCase().includes('vocal'));
            if (vocalModel && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            }
            break;
          case 2: // Optimizar Modelo de Abecedario
            const abcModel = models.find(m => m.title.toLowerCase().includes('abecedario'));
            if (abcModel && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            }
            break;
          case 3: // Implementar Modelo de Palabras
            const wordModel = models.find(m => m.title.toLowerCase().includes('palabra'));
            if (wordModel && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            }
            break;
          case 4: // Validar Operaciones Aritméticas
            const mathModel = models.find(m => m.title.toLowerCase().includes('aritmétic') || m.title.toLowerCase().includes('operacion'));
            if (mathModel && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            }
            break;
            
          // Misiones de Cursos (simuladas como disponibles)
          case 5: // Dominar Reconocimiento de Manos
          case 6: // Especialista en Reconocimiento Facial
          case 7: // Maestro de Voz con IA
          case 8: // Operaciones Matemáticas Gestuales
          case 9: // Desarrollador de Agente IA
          case 10: // Constructor de Chatbots
            if (!mission.completed) {
              newProgress = Math.floor(Math.random() * 30); // Progreso simulado 0-30%
            }
            break;
            
          // Misiones Futuras (próximamente)
          case 11: // Detector de Emociones
          case 12: // Traductor Universal
            if (!mission.completed) {
              newProgress = 0; // Aún no disponibles
            }
            break;
            
          // Misiones Maestras
          case 13: // Maestro de Modelos
            const completedModels = models.length;
            if (completedModels >= 4 && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            } else if (completedModels > 0) {
              newProgress = (completedModels / 4) * 100;
            }
            break;
            
          case 14: // Graduado en IA
            // Basado en cursos completados (simulado)
            const availableCourses = 6; // Cursos disponibles actualmente
            const completedCourses = prevMissions.filter(m => 
              m.type === 'course' && m.completed && m.id >= 5 && m.id <= 10
            ).length;
            if (completedCourses >= availableCourses && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            } else {
              newProgress = (completedCourses / availableCourses) * 100;
            }
            break;
            
          case 15: // Pionero del Blackboard
            // Basado en todas las misiones completadas
            const totalCompletableMissions = prevMissions.filter(m => 
              m.id !== 15 && m.type !== 'future'
            ).length;
            const totalCompleted = prevMissions.filter(m => 
              m.completed && m.id !== 15 && m.type !== 'future'
            ).length;
            if (totalCompleted >= totalCompletableMissions && !mission.completed) {
              newProgress = 100;
              newCompleted = true;
            } else {
              newProgress = (totalCompleted / totalCompletableMissions) * 100;
            }
            break;
        }

        return { ...mission, progress: newProgress, completed: newCompleted };
      })
    );
  }, [models]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Fácil': return 'text-green-400 bg-green-400/10';
      case 'Medio': return 'text-yellow-400 bg-yellow-400/10';
      case 'Difícil': return 'text-red-400 bg-red-400/10';
      case 'Experto': return 'text-purple-400 bg-purple-400/10';
      case 'Legendario': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getMissionTypeColor = (type: string): string => {
    switch (type) {
      case 'training': return 'bg-blue-500/10 text-blue-600';
      case 'optimization': return 'bg-green-500/10 text-green-600';
      case 'deployment': return 'bg-purple-500/10 text-purple-600';
      case 'validation': return 'bg-orange-500/10 text-orange-600';
      case 'course': return 'bg-indigo-500/10 text-indigo-600';
      case 'future': return 'bg-gray-500/10 text-gray-500';
      case 'master': return 'bg-yellow-500/10 text-yellow-600';
      case 'ultimate': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  const activeMissions = missions.filter(m => !m.completed);
  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;

  return (
     <div className="card bg-white shadow-soft">
       {/* Header */}
       <div 
         className="flex items-center justify-between p-4 cursor-pointer hover:bg-alt transition-colors rounded-xl"
         onClick={() => setIsExpanded(!isExpanded)}
       >
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <Trophy className="w-5 h-5 text-primary" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-header font-poppins">Misiones de Modelos</h3>
             <p className="text-slate-600 text-sm">
               {activeMissions.length} pendientes • {completedMissions}/{totalMissions} completadas
             </p>
           </div>
         </div>
         <div className="flex items-center gap-2">
           <span className="text-sm text-primary font-medium">
             {Math.round((completedMissions / totalMissions) * 100)}%
           </span>
           {isExpanded ? (
             <ChevronUp className="w-5 h-5 text-slate-500" />
           ) : (
             <ChevronDown className="w-5 h-5 text-slate-500" />
           )}
         </div>
       </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
               {/* Progress Bar */}
               <div className="mb-4">
                 <div className="flex justify-between text-sm text-slate-600 mb-2">
                   <span>Progreso General</span>
                   <span>{Math.round((completedMissions / totalMissions) * 100)}%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-2">
                   <motion.div
                     className="bg-primary h-2 rounded-full"
                     initial={{ width: 0 }}
                     animate={{ width: `${(completedMissions / totalMissions) * 100}%` }}
                     transition={{ duration: 0.8, ease: "easeOut" }}
                   />
                 </div>
               </div>

               {/* Active Missions List */}
               <div className="space-y-3">
                 {activeMissions.map((mission, index) => {
                   const IconComponent = mission.icon;
                   return (
                     <motion.div
                       key={mission.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.1 }}
                       className="bg-alt border border-slate-200 rounded-xl p-4 hover:border-primary/50 hover:bg-white transition-all duration-300 shadow-sm"
                     >
                       <div className="flex items-start gap-3">
                         <div className={`p-2 rounded-lg flex-shrink-0 ${getMissionTypeColor(mission.type)}`}>
                           <IconComponent className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                             <h4 className="text-header font-medium text-sm truncate font-poppins">{mission.title}</h4>
                             <div className="flex items-center gap-1">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionTypeColor(mission.type)}`}>
                                 {mission.type === 'training' ? 'Entrenamiento' :
                                  mission.type === 'optimization' ? 'Optimización' :
                                  mission.type === 'deployment' ? 'Despliegue' :
                                  mission.type === 'validation' ? 'Validación' :
                                  mission.type === 'course' ? 'Curso' :
                                  mission.type === 'future' ? 'Próximamente' :
                                  mission.type === 'master' ? 'Maestro' :
                                  mission.type === 'ultimate' ? 'Definitivo' : 'Misión'}
                               </span>
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                                 {mission.difficulty}
                               </span>
                             </div>
                           </div>
                           <p className="text-slate-600 text-xs mb-2 line-clamp-2">{mission.description}</p>
                           <div className="flex items-center justify-between">
                             <span className="text-primary text-xs font-medium">{mission.reward}</span>
                             {mission.progress > 0 && (
                               <div className="flex items-center gap-2">
                                 <div className="w-16 bg-slate-200 rounded-full h-1">
                                   <div
                                     className={`h-1 rounded-full transition-all duration-500 ${
                                       mission.type === 'training' ? 'bg-blue-500' :
                                       mission.type === 'optimization' ? 'bg-green-500' :
                                       mission.type === 'deployment' ? 'bg-purple-500' :
                                       mission.type === 'validation' ? 'bg-orange-500' :
                                       mission.type === 'course' ? 'bg-indigo-500' :
                                       mission.type === 'master' ? 'bg-yellow-500' :
                                       mission.type === 'ultimate' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                       'bg-gray-500'
                                     }`}
                                     style={{ width: `${mission.progress}%` }}
                                   />
                                 </div>
                                 <span className="text-xs text-slate-500">{Math.round(mission.progress)}%</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   );
                 })}
                 
                 {activeMissions.length === 0 && (
                   <div className="text-center py-8">
                     <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
                     <p className="text-header font-poppins font-medium">¡Todas las misiones completadas!</p>
                     <p className="text-slate-600 text-sm">Excelente trabajo entrenando modelos</p>
                   </div>
                 )}
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MissionsPanel;