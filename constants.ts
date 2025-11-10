import { Belt, BeltType, Plan } from './types.ts';

export const IBJJF_BELTS: Belt[] = [
    // Kids
    { name: 'Branca', color: '#FFFFFF', type: BeltType.Kid },
    { name: 'Cinza e Branca', color: '#808080', type: BeltType.Kid },
    { name: 'Cinza', color: '#808080', type: BeltType.Kid },
    { name: 'Cinza e Preta', color: '#808080', type: BeltType.Kid },
    { name: 'Amarela e Branca', color: '#FFFF00', type: BeltType.Kid },
    { name: 'Amarela', color: '#FFFF00', type: BeltType.Kid },
    { name: 'Amarela e Preta', color: '#FFFF00', type: BeltType.Kid },
    { name: 'Laranja e Branca', color: '#FFA500', type: BeltType.Kid },
    { name: 'Laranja', color: '#FFA500', type: BeltType.Kid },
    { name: 'Laranja e Preta', color: '#FFA500', type: BeltType.Kid },
    { name: 'Verde e Branca', color: '#008000', type: BeltType.Kid },
    { name: 'Verde', color: '#008000', type: BeltType.Kid },
    { name: 'Verde e Preta', color: '#008000', type: BeltType.Kid },
    // Adults
    { name: 'Branca', color: '#FFFFFF', type: BeltType.Adult },
    { name: 'Azul', color: '#0000FF', type: BeltType.Adult },
    { name: 'Roxa', color: '#800080', type: BeltType.Adult },
    { name: 'Marrom', color: '#A52A2A', type: BeltType.Adult },
    { name: 'Preta', color: '#000000', type: BeltType.Adult },
    { name: 'Coral (Vermelha e Preta)', color: '#FF0000', type: BeltType.Adult },
    { name: 'Coral (Vermelha e Branca)', color: '#FF0000', type: BeltType.Adult },
    { name: 'Vermelha', color: '#FF0000', type: BeltType.Adult },
];

export const getBeltKey = (belt: Belt): string => `${belt.name}-${belt.type}`;

export const findBelt = (name: string, type: BeltType): Belt | undefined => {
    return IBJJF_BELTS.find(b => b.name === name && b.type === type);
}

export const DEFAULT_PLANS: Plan[] = [
    { id: '1', name: 'Mensal', price: 150 },
    { id: '2', name: 'Trimestral', price: 400 },
    { id: '3', name: 'Anual', price: 1500 },
    { id: '4', name: 'Aula Avulsa', price: 50 },
];
