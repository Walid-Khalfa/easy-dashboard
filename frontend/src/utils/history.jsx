/**
 * React Router v6 Navigation Utilities
 * 
 * In React Router v6, we use useNavigate hook for programmatic navigation
 * instead of the custom history object.
 * 
 * Usage in components:
 * ```jsx
 * import { useNavigate } from 'react-router-dom';
 * 
 * function MyComponent() {
 *   const navigate = useNavigate();
 *   
 *   const handleClick = () => {
 *     navigate('/some-path');
 *   };
 *   
 *   return <button onClick={handleClick}>Navigate</button>;
 * }
 * ```
 */

// Export a custom hook for navigation with common patterns
export { useNavigate, useLocation, useParams } from 'react-router-dom';

// Default export for backward compatibility (empty object)
export default {};
