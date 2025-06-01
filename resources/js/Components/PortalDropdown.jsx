import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function PortalDropdown({ isOpen, anchorRect, onClose, children }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen || !anchorRect) return null;

    const style = {
        position: 'absolute',
        top: anchorRect.bottom + window.scrollY + 4, // 4px gap
        left: anchorRect.left + window.scrollX,
        minWidth: anchorRect.width,
        zIndex: 9999,
    };

    return ReactDOM.createPortal(
        <div ref={dropdownRef} style={style} className="bg-white rounded-lg shadow-lg border border-[#E8E6E1] max-h-60 overflow-y-auto p-2">
            {children}
        </div>,
        document.body
    );
}
