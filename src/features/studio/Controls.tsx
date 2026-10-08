import type { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';
export function Toggle({checked,onChange,label}:{checked:boolean;onChange:(v:boolean)=>void;label:string}){return <Switch checked={checked} onCheckedChange={onChange} aria-label={label}/>}
export function Range({label,value,min,max,onChange,suffix='',step=1}:{label:string;value:number;min:number;max:number;onChange:(n:number)=>void;suffix?:string;step?:number}){return <label className="range-control"><span>{label}<b>{value}{suffix}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="field-label"><span>{label}</span>{children}</label>}
