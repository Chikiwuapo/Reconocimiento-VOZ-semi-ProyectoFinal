from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from unittest.mock import patch, MagicMock
import json
import uuid

from .models import ChatSession, ChatMessage, ChatAnalytics
from .services.chatbot_service import ChatbotService

class ChatSessionModelTest(TestCase):
    """Tests para el modelo ChatSession"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_chat_session(self):
        """Test crear una sesión de chat"""
        session = ChatSession.objects.create(user=self.user)
        
        self.assertIsNotNone(session.session_id)
        self.assertEqual(session.user, self.user)
        self.assertTrue(session.is_active)
        self.assertIsNotNone(session.created_at)
    
    def test_session_id_is_unique(self):
        """Test que el session_id es único"""
        session1 = ChatSession.objects.create(user=self.user)
        session2 = ChatSession.objects.create(user=self.user)
        
        self.assertNotEqual(session1.session_id, session2.session_id)
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        session = ChatSession.objects.create(user=self.user)
        expected = f"Sesión {session.session_id[:8]} - {self.user.username}"
        self.assertEqual(str(session), expected)

class ChatMessageModelTest(TestCase):
    """Tests para el modelo ChatMessage"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.session = ChatSession.objects.create(user=self.user)
    
    def test_create_user_message(self):
        """Test crear mensaje de usuario"""
        message = ChatMessage.objects.create(
            session=self.session,
            message_type='user',
            content='Hola, ¿cómo estás?'
        )
        
        self.assertEqual(message.session, self.session)
        self.assertEqual(message.message_type, 'user')
        self.assertEqual(message.content, 'Hola, ¿cómo estás?')
        self.assertIsNone(message.bot_confidence)
    
    def test_create_bot_message(self):
        """Test crear mensaje del bot"""
        message = ChatMessage.objects.create(
            session=self.session,
            message_type='bot',
            content='¡Hola! Estoy bien, gracias.',
            bot_confidence=0.95,
            intent_detected='greeting'
        )
        
        self.assertEqual(message.message_type, 'bot')
        self.assertEqual(message.bot_confidence, 0.95)
        self.assertEqual(message.intent_detected, 'greeting')
    
    def test_get_confidence_percentage(self):
        """Test método get_confidence_percentage"""
        message = ChatMessage.objects.create(
            session=self.session,
            message_type='bot',
            content='Test',
            bot_confidence=0.85
        )
        
        self.assertEqual(message.get_confidence_percentage(), 85)
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        message = ChatMessage.objects.create(
            session=self.session,
            message_type='user',
            content='Test message'
        )
        
        expected = f"{message.message_type}: Test message"
        self.assertEqual(str(message), expected)

class ChatbotViewsTest(TestCase):
    """Tests para las vistas del chatbot"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.session = ChatSession.objects.create(user=self.user)
    
    def test_chat_interface_view(self):
        """Test vista de interfaz de chat"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('chatbot_educativo:chat_interface'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Asistente Educativo IA')
        self.assertContains(response, 'chatbot-container')
    
    def test_chat_interface_anonymous_user(self):
        """Test vista de chat para usuario anónimo"""
        response = self.client.get(reverse('chatbot_educativo:chat_interface'))
        
        # Debería funcionar para usuarios anónimos también
        self.assertEqual(response.status_code, 200)
    
    @patch('chatbot_educativo.services.chatbot_service.ChatbotService.process_message')
    def test_chat_api_post(self, mock_process):
        """Test API de chat con POST"""
        mock_process.return_value = {
            'response': 'Hola, ¿en qué puedo ayudarte?',
            'confidence': 0.95,
            'intent': 'greeting'
        }
        
        self.client.login(username='testuser', password='testpass123')
        
        data = {
            'message': 'Hola',
            'session_id': str(self.session.session_id)
        }
        
        response = self.client.post(
            reverse('chatbot_educativo:chat_api'),
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        
        self.assertEqual(response_data['response'], 'Hola, ¿en qué puedo ayudarte?')
        self.assertEqual(response_data['confidence'], 0.95)
        self.assertEqual(response_data['intent'], 'greeting')
    
    def test_chat_api_invalid_method(self):
        """Test API de chat con método inválido"""
        response = self.client.get(reverse('chatbot_educativo:chat_api'))
        self.assertEqual(response.status_code, 405)
    
    def test_health_check_view(self):
        """Test vista de health check"""
        response = self.client.get(reverse('chatbot_educativo:health_check'))
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        
        self.assertEqual(response_data['status'], 'healthy')
        self.assertIn('timestamp', response_data)
    
    def test_chat_history_view(self):
        """Test vista de historial de chat"""
        self.client.login(username='testuser', password='testpass123')
        
        # Crear algunos mensajes
        ChatMessage.objects.create(
            session=self.session,
            message_type='user',
            content='Mensaje 1'
        )
        ChatMessage.objects.create(
            session=self.session,
            message_type='bot',
            content='Respuesta 1',
            bot_confidence=0.9
        )
        
        response = self.client.get(
            reverse('chatbot_educativo:chat_history'),
            {'session_id': str(self.session.session_id)}
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        
        self.assertEqual(len(response_data['messages']), 2)
        self.assertEqual(response_data['messages'][0]['content'], 'Mensaje 1')

class ChatbotServiceTest(TestCase):
    """Tests para el servicio del chatbot"""
    
    def setUp(self):
        self.service = ChatbotService()
    
    @patch('chatbot_educativo.services.chatbot_service.ChatbotService._load_models')
    def test_service_initialization(self, mock_load):
        """Test inicialización del servicio"""
        mock_load.return_value = None
        service = ChatbotService()
        
        self.assertIsNotNone(service)
        mock_load.assert_called_once()
    
    @patch('chatbot_educativo.services.chatbot_service.ChatbotService._predict_intent')
    @patch('chatbot_educativo.services.chatbot_service.ChatbotService._generate_response')
    def test_process_message(self, mock_generate, mock_predict):
        """Test procesamiento de mensaje"""
        mock_predict.return_value = ('greeting', 0.95)
        mock_generate.return_value = 'Hola, ¿en qué puedo ayudarte?'
        
        result = self.service.process_message('Hola')
        
        self.assertIn('response', result)
        self.assertIn('confidence', result)
        self.assertIn('intent', result)
        self.assertEqual(result['intent'], 'greeting')
        self.assertEqual(result['confidence'], 0.95)
    
    def test_health_check(self):
        """Test health check del servicio"""
        result = self.service.health_check()
        
        self.assertIn('status', result)
        self.assertIn('models_loaded', result)
        self.assertIn('timestamp', result)

class ChatAnalyticsModelTest(TestCase):
    """Tests para el modelo ChatAnalytics"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.session = ChatSession.objects.create(user=self.user)
    
    def test_create_analytics(self):
        """Test crear analytics de sesión"""
        analytics = ChatAnalytics.objects.create(
            session=self.session,
            total_messages=10,
            user_messages=5,
            bot_messages=5,
            avg_confidence=0.85
        )
        
        self.assertEqual(analytics.session, self.session)
        self.assertEqual(analytics.total_messages, 10)
        self.assertEqual(analytics.user_messages, 5)
        self.assertEqual(analytics.bot_messages, 5)
        self.assertEqual(analytics.avg_confidence, 0.85)
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        analytics = ChatAnalytics.objects.create(
            session=self.session,
            total_messages=5
        )
        
        expected = f"Analytics para {self.session.session_id[:8]} - 5 mensajes"
        self.assertEqual(str(analytics), expected)

class IntegrationTest(TestCase):
    """Tests de integración completos"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    @patch('chatbot_educativo.services.chatbot_service.ChatbotService.process_message')
    def test_complete_chat_flow(self, mock_process):
        """Test flujo completo de chat"""
        mock_process.return_value = {
            'response': 'Test response',
            'confidence': 0.9,
            'intent': 'test'
        }
        
        self.client.login(username='testuser', password='testpass123')
        
        # 1. Acceder a la interfaz de chat
        response = self.client.get(reverse('chatbot_educativo:chat_interface'))
        self.assertEqual(response.status_code, 200)
        
        # 2. Enviar mensaje via API
        data = {
            'message': 'Test message'
        }
        
        response = self.client.post(
            reverse('chatbot_educativo:chat_api'),
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 3. Verificar que se crearon los mensajes
        self.assertTrue(ChatMessage.objects.filter(content='Test message').exists())
        self.assertTrue(ChatMessage.objects.filter(content='Test response').exists())
        
        # 4. Verificar que se creó la sesión
        self.assertTrue(ChatSession.objects.filter(user=self.user).exists())