import type { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Phone, Mail, Facebook, Linkedin } from 'lucide-react';


export const Footer: FC = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      icon: Facebook,
      label: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61581760197246",
      color: "hover:bg-[#1877f2]",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/impact-r-d/posts/?feedView=all",
      color: "hover:bg-[#0077b5]",
    },
  ];

  const handleAdminClick = (e: MouseEvent) => {
    e.preventDefault();
    // Navigate immediately without checking current location
    navigate('/admin');
  };

  return (
    <footer className="relative bg-[#f0f2f5] border-t border-gray-200">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Main Content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Section - Compact */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
                <img
                  src="/images/logos/impact.png"
                  alt="IMPACT R&D Logo"
                  className="h-8 w-8 object-contain"
                />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  IMPACT R&D
                </h3>
                <p className="text-[11px] text-gray-500 -mt-0.5">
                  Transforming Communities
                </p>
              </div>
            </div>

            {/* Social Media Links - Compact */}
            <div className="flex items-center gap-1.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank" // <-- open in new tab
                    rel="noopener noreferrer" // <-- security best practice
                    className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 transition-all duration-300 ${social.color} hover:text-white shadow-sm hover:shadow`}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Info - Compact Horizontal Layout */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[12px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1887FC]" />
              <span>Philippines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1887FC]" />
              <a
                href="mailto:info@impactrd.ph"
                className="hover:text-[#1887FC] hover:underline transition-colors"
              >
                info@impactrd.ph
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1887FC]" />
              <span>+63 XXX XXX XXXX</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Facebook Style */}
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-[11px] text-gray-500 text-center">
            <span
              onClick={handleAdminClick}
              className="cursor-pointer hover:text-[#1887FC] hover:underline transition-colors"
            >
              ©
            </span>{" "}
            2023 IMPACT R&D. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};