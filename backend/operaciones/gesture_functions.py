import subprocess
import os
import json
import webbrowser
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class GestureFunctionExecutor:
    """
    Ejecutor de funciones asociadas a gestos reconocidos.
    """
    
    def __init__(self):
        self.function_map = {
            'open_application': self.open_application,
            'system_command': self.execute_system_command,
            'web_action': self.execute_web_action,
            'media_control': self.execute_media_control,
            'custom_script': self.execute_custom_script,
            'notification': self.show_notification,
            'file_operation': self.execute_file_operation,
            'window_control': self.execute_window_control
        }
    
    def execute_function(self, function_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta una función basada en el tipo y parámetros proporcionados.
        
        Args:
            function_type: Tipo de función a ejecutar
            parameters: Parámetros de la función
            
        Returns:
            Diccionario con el resultado de la ejecución
        """
        try:
            if function_type not in self.function_map:
                return {
                    'success': False,
                    'error': f'Tipo de función no soportado: {function_type}',
                    'message': ''
                }
            
            function = self.function_map[function_type]
            result = function(parameters)
            
            return {
                'success': True,
                'message': result.get('message', 'Función ejecutada correctamente'),
                'data': result.get('data', {})
            }
            
        except Exception as e:
            logger.error(f"Error ejecutando función {function_type}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': f'Error al ejecutar {function_type}'
            }
    
    def open_application(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Abre una aplicación del sistema.
        
        Args:
            parameters: {'app_path': str, 'app_name': str, 'arguments': list}
        """
        try:
            app_path = parameters.get('app_path', '')
            app_name = parameters.get('app_name', '')
            arguments = parameters.get('arguments', [])
            
            if app_path:
                command = [app_path] + arguments
            elif app_name:
                # Aplicaciones comunes en Windows
                common_apps = {
                    'notepad': 'notepad.exe',
                    'calculator': 'calc.exe',
                    'paint': 'mspaint.exe',
                    'browser': 'start chrome',
                    'explorer': 'explorer.exe',
                    'cmd': 'cmd.exe'
                }
                
                if app_name.lower() in common_apps:
                    if app_name.lower() == 'browser':
                        subprocess.Popen(common_apps[app_name.lower()], shell=True)
                        return {'message': f'Abriendo {app_name}'}
                    else:
                        command = [common_apps[app_name.lower()]] + arguments
                else:
                    return {'message': f'Aplicación {app_name} no encontrada'}
            else:
                return {'message': 'No se especificó aplicación a abrir'}
            
            subprocess.Popen(command)
            return {'message': f'Aplicación {app_name or app_path} abierta correctamente'}
            
        except Exception as e:
            raise Exception(f"Error abriendo aplicación: {e}")
    
    def execute_system_command(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta un comando del sistema.
        
        Args:
            parameters: {'command': str, 'shell': bool, 'timeout': int}
        """
        try:
            command = parameters.get('command', '')
            use_shell = parameters.get('shell', True)
            timeout = parameters.get('timeout', 30)
            
            if not command:
                return {'message': 'No se especificó comando a ejecutar'}
            
            # Lista de comandos permitidos por seguridad
            allowed_commands = [
                'dir', 'ls', 'echo', 'date', 'time', 'whoami',
                'ipconfig', 'ping', 'tasklist', 'systeminfo'
            ]
            
            command_base = command.split()[0].lower()
            if command_base not in allowed_commands:
                return {'message': f'Comando {command_base} no permitido por seguridad'}
            
            result = subprocess.run(
                command,
                shell=use_shell,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            return {
                'message': f'Comando ejecutado: {command}',
                'data': {
                    'output': result.stdout,
                    'error': result.stderr,
                    'return_code': result.returncode
                }
            }
            
        except subprocess.TimeoutExpired:
            raise Exception(f"Comando excedió el tiempo límite de {timeout} segundos")
        except Exception as e:
            raise Exception(f"Error ejecutando comando: {e}")
    
    def execute_web_action(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta acciones web como abrir URLs.
        
        Args:
            parameters: {'url': str, 'action': str}
        """
        try:
            url = parameters.get('url', '')
            action = parameters.get('action', 'open')
            
            if not url:
                return {'message': 'No se especificó URL'}
            
            if action == 'open':
                webbrowser.open(url)
                return {'message': f'Abriendo URL: {url}'}
            else:
                return {'message': f'Acción web {action} no soportada'}
                
        except Exception as e:
            raise Exception(f"Error en acción web: {e}")
    
    def execute_media_control(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Controla reproducción de media.
        
        Args:
            parameters: {'action': str, 'volume': int}
        """
        try:
            action = parameters.get('action', '')
            volume = parameters.get('volume', None)
            
            # Comandos de media en Windows usando nircmd (si está disponible)
            media_commands = {
                'play': 'nircmd.exe sendkeypress ctrl+space',
                'pause': 'nircmd.exe sendkeypress ctrl+space',
                'next': 'nircmd.exe sendkeypress ctrl+right',
                'previous': 'nircmd.exe sendkeypress ctrl+left',
                'volume_up': 'nircmd.exe changesysvolume 2000',
                'volume_down': 'nircmd.exe changesysvolume -2000',
                'mute': 'nircmd.exe mutesysvolume 1'
            }
            
            if action in media_commands:
                try:
                    subprocess.run(media_commands[action], shell=True, check=False)
                    return {'message': f'Acción de media ejecutada: {action}'}
                except:
                    # Fallback usando teclas del sistema
                    return {'message': f'Simulando acción de media: {action}'}
            else:
                return {'message': f'Acción de media {action} no soportada'}
                
        except Exception as e:
            raise Exception(f"Error en control de media: {e}")
    
    def execute_custom_script(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta un script personalizado.
        
        Args:
            parameters: {'script_path': str, 'script_type': str, 'arguments': list}
        """
        try:
            script_path = parameters.get('script_path', '')
            script_type = parameters.get('script_type', 'python')
            arguments = parameters.get('arguments', [])
            
            if not script_path or not os.path.exists(script_path):
                return {'message': 'Script no encontrado'}
            
            if script_type == 'python':
                command = ['python', script_path] + arguments
            elif script_type == 'batch':
                command = [script_path] + arguments
            elif script_type == 'powershell':
                command = ['powershell', '-File', script_path] + arguments
            else:
                return {'message': f'Tipo de script {script_type} no soportado'}
            
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return {
                'message': f'Script ejecutado: {script_path}',
                'data': {
                    'output': result.stdout,
                    'error': result.stderr,
                    'return_code': result.returncode
                }
            }
            
        except Exception as e:
            raise Exception(f"Error ejecutando script: {e}")
    
    def show_notification(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Muestra una notificación del sistema.
        
        Args:
            parameters: {'title': str, 'message': str, 'duration': int}
        """
        try:
            title = parameters.get('title', 'Gesto Reconocido')
            message = parameters.get('message', 'Gesto ejecutado correctamente')
            duration = parameters.get('duration', 3000)
            
            # En Windows, usar msg o toast notifications
            try:
                # Intentar usar PowerShell para notificaciones toast
                ps_command = f'''
                Add-Type -AssemblyName System.Windows.Forms
                $notification = New-Object System.Windows.Forms.NotifyIcon
                $notification.Icon = [System.Drawing.SystemIcons]::Information
                $notification.BalloonTipTitle = "{title}"
                $notification.BalloonTipText = "{message}"
                $notification.Visible = $true
                $notification.ShowBalloonTip({duration})
                '''
                
                subprocess.run(
                    ['powershell', '-Command', ps_command],
                    check=False,
                    capture_output=True
                )
                
                return {'message': f'Notificación mostrada: {title}'}
                
            except:
                # Fallback: log de la notificación
                logger.info(f"Notificación: {title} - {message}")
                return {'message': f'Notificación registrada: {title}'}
                
        except Exception as e:
            raise Exception(f"Error mostrando notificación: {e}")
    
    def execute_file_operation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta operaciones de archivos.
        
        Args:
            parameters: {'operation': str, 'file_path': str, 'destination': str}
        """
        try:
            operation = parameters.get('operation', '')
            file_path = parameters.get('file_path', '')
            destination = parameters.get('destination', '')
            
            if operation == 'open':
                if os.path.exists(file_path):
                    os.startfile(file_path)
                    return {'message': f'Archivo abierto: {file_path}'}
                else:
                    return {'message': f'Archivo no encontrado: {file_path}'}
            
            elif operation == 'copy':
                import shutil
                if os.path.exists(file_path) and destination:
                    shutil.copy2(file_path, destination)
                    return {'message': f'Archivo copiado de {file_path} a {destination}'}
                else:
                    return {'message': 'Archivo origen no encontrado o destino no especificado'}
            
            elif operation == 'delete':
                if os.path.exists(file_path):
                    os.remove(file_path)
                    return {'message': f'Archivo eliminado: {file_path}'}
                else:
                    return {'message': f'Archivo no encontrado: {file_path}'}
            
            else:
                return {'message': f'Operación de archivo {operation} no soportada'}
                
        except Exception as e:
            raise Exception(f"Error en operación de archivo: {e}")
    
    def execute_window_control(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Controla ventanas del sistema.
        
        Args:
            parameters: {'action': str, 'window_title': str}
        """
        try:
            action = parameters.get('action', '')
            window_title = parameters.get('window_title', '')
            
            # Comandos básicos de ventana usando teclas del sistema
            window_commands = {
                'minimize_all': 'nircmd.exe win min alltop',
                'restore_all': 'nircmd.exe win max alltop',
                'close_active': 'nircmd.exe sendkeypress alt+f4',
                'switch_window': 'nircmd.exe sendkeypress alt+tab',
                'show_desktop': 'nircmd.exe sendkeypress win+d'
            }
            
            if action in window_commands:
                try:
                    subprocess.run(window_commands[action], shell=True, check=False)
                    return {'message': f'Acción de ventana ejecutada: {action}'}
                except:
                    return {'message': f'Simulando acción de ventana: {action}'}
            else:
                return {'message': f'Acción de ventana {action} no soportada'}
                
        except Exception as e:
            raise Exception(f"Error en control de ventana: {e}")

# Instancia global del ejecutor
gesture_executor = GestureFunctionExecutor()