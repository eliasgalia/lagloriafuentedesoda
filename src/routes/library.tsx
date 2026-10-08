import { createFileRoute } from '@tanstack/react-router';
import { StudioApp } from '@/features/studio/StudioApp';
export const Route = createFileRoute('/library')({
 head:()=>({meta:[{title:'Biblioteca de La Gloria | Galia Studio'},{name:'description',content:'Clips, reels y videos de marca de La Gloria: organiza tu contenido y revisa tus resultados de demostración.'},{property:'og:title',content:'Biblioteca de La Gloria | Galia Studio'},{property:'og:description',content:'El archivo creativo de La Gloria, Fuente de Soda de Barrio Franklin.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <StudioApp view="library"/>,
});
