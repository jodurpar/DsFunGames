import { useEffect } from 'react';

export interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    url?: string;
    image?: string;
}

export function useSEO({ title, description, keywords, url, image }: SEOProps) {
    useEffect(() => {
        // Basic meta tags
        document.title = title;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute('content', description);
        else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = description;
            document.head.appendChild(meta);
        }

        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) metaKeywords.setAttribute('content', keywords);
            else {
                const meta = document.createElement('meta');
                meta.name = 'keywords';
                meta.content = keywords;
                document.head.appendChild(meta);
            }
        }

        // Open Graph meta tags
        const updateOGTag = (property: string, content: string) => {
            const tag = document.querySelector(`meta[property="${property}"]`);
            if (tag) {
                tag.setAttribute('content', content);
            } else {
                const meta = document.createElement('meta');
                meta.setAttribute('property', property);
                meta.setAttribute('content', content);
                document.head.appendChild(meta);
            }
        };

        updateOGTag('og:title', title);
        updateOGTag('og:description', description);

        if (url) {
            updateOGTag('og:url', url);
            // Set canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.setAttribute('href', url);
            } else {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                canonical.setAttribute('href', url);
                document.head.appendChild(canonical);
            }
        }

        if (image) updateOGTag('og:image', image);

        // Twitter Object meta tags
        const updateTwitterTag = (name: string, content: string) => {
            const tag = document.querySelector(`meta[name="${name}"]`);
            if (tag) {
                tag.setAttribute('content', content);
            } else {
                const meta = document.createElement('meta');
                meta.setAttribute('name', name);
                meta.setAttribute('content', content);
                document.head.appendChild(meta);
            }
        };

        updateTwitterTag('twitter:title', title);
        updateTwitterTag('twitter:description', description);
        if (image) updateTwitterTag('twitter:image', image);

    }, [title, description, keywords, url, image]);
}
