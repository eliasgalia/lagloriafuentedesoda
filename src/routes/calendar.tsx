import { createFileRoute } from '@tanstack/react-router';
import { StudioApp } from '@/features/studio/StudioApp';
export const Route = createFileRoute('/calendar')({
 head:()=>({meta:[{title:'Calendario de La Gloria | Galia Studio'},{name:'description',content:'Planifica la semana de contenido de La Gloria. Revisa reels publicados, programados y borradores.'},{property:'og:title',content:'Calendario de La Gloria | Galia Studio'},{property:'og:description',content:'La próxima semana de La Gloria, con todo su sabor: calendario de contenido creativo.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <StudioApp view="calendar"/>,
});
