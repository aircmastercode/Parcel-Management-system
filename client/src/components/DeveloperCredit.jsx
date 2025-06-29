import React from 'react';
import { FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';

const DeveloperCredit = ({ 
  variant = 'default', 
  className = '',
  showTitle = false,
  showDescription = false,
  showSocialLinks = true
}) => {
  const variants = {
    default: {
      container: 'text-center mt-5',
      text: 'text-sm text-secondary-text',
      name: 'text-railway-primary font-medium hover:text-railway-primary-light transition-colors',
      socialContainer: 'flex justify-center space-x-3 mt-3',
      socialLink: 'text-secondary-text hover:text-railway-primary transition-colors'
    },
    dark: {
      container: 'text-center mt-5',
      text: 'text-sm text-soft-gray',
      name: 'text-railway-primary-light font-medium hover:text-railway-primary transition-colors',
      socialContainer: 'flex justify-center space-x-3 mt-3',
      socialLink: 'text-soft-gray hover:text-railway-primary-light transition-colors'
    },
    footer: {
      container: 'border-t border-mid-gray pt-6 mt-5',
      text: 'text-secondary-text text-base',
      name: 'text-railway-primary font-medium hover:text-railway-primary-light transition-colors',
      socialContainer: 'flex justify-center space-x-4 mt-3',
      socialLink: 'text-secondary-text hover:text-railway-primary transition-colors'
    }
  };

  const styles = variants[variant] || variants.default;

  return (
    <div className={`${styles.container} ${className}`}>
      <p className={styles.text}>
        {showTitle ? 'Built with ❤️ by ' : 'Built by '}
        <span className={styles.name}>
          Tanush Singhal
        </span>
      </p>
      {showDescription && (
        <p className="text-slate-600 text-sm mt-1">
          Full-stack developer & system architect
        </p>
      )}
      
      {showSocialLinks && (
        <div className={styles.socialContainer}>
          <a 
            href="https://www.linkedin.com/in/tanushprofile2004/?originalSubdomain=in" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="LinkedIn Profile"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://www.instagram.com/tanushairc/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Instagram Profile"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/aircmastercode" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="GitHub Profile"
          >
            <FaGithub className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default DeveloperCredit; 