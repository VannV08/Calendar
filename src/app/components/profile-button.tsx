import React from 'react';

export interface ProfileButtonProps {
    text: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ text }) => {
    return (
        <div className="relative flex items-center h-[60px] w-[90%] m-2 bg-Bright-Yellow-Orange rounded-[28px] shadow-lg mx-auto">
                <div className="absolute left-[18px] flex items-center">
                    
                    <svg width="4" height="30" viewBox="0 0 4 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="4" height="30" rx="2" fill="white"/>
                    </svg>

                </div>
                <span 
                className="flex-grow text-start ml-[29px] text-[18px] text-white font-medium ">
                    {text}
                </span>
        </div>
    );
};

export default ProfileButton;
