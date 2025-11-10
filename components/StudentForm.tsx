import React, { useState, useEffect, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents.tsx';
import { Student, Belt, BeltType } from '../types.ts';
import { IBJJF_BELTS, findBelt } from '../constants.ts';

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose }) => {
  const { addStudent, updateStudent } = useStudents();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBeltName, setSelectedBeltName] = useState('Branca');
  const [isActive, setIsActive] = useState(true);

  const beltType = useMemo(() => {
    const studentAge = parseInt(age, 10);
    return !isNaN(studentAge) && studentAge < 16 ? BeltType.Kid : BeltType.Adult;
  }, [age]);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setAge(String(student.age));
      setPhone(student.phone);
      setAddress(student.address);
      setStartDate(new Date(student.startDate).toISOString().split('T')[0]);
      setSelectedBeltName(student.belt.name);
      setIsActive(student.isActive);
    } else {
        // Reset form for new student
        setName('');
        setAge('');
        setPhone('');
        setAddress('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setSelectedBeltName('Branca');
        setIsActive(true);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentAge = parseInt(age, 10);
    if (!name || isNaN(studentAge) || studentAge <= 0) {
      alert('Por favor, preencha nome e idade corretamente.');
      return;
    }

    const finalBeltType = studentAge < 16 ? BeltType.Kid : BeltType.Adult;
    const selectedBelt = findBelt(selectedBeltName, finalBeltType);
    if (!selectedBelt) {
        alert('Faixa inválida selecionada.');
        return;
    }

    const studentData = { name, age: studentAge, phone, address, startDate: new Date(startDate).toISOString(), belt: selectedBelt, isActive };
    
    if (student) {
      updateStudent(student.id, studentData);
    } else {
      addStudent(studentData);
    }
    onClose();
  };
  
  const availableBelts = IBJJF_BELTS.filter(b => b.type === beltType);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nome Completo</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-300">Idade</label>
          <input type="number" id="age" value={age} onChange={e => {
              setAge(e.target.value);
              // if age changes, belt type might change, reset selected belt to white
              if (parseInt(e.target.value, 10) < 16) {
                  setSelectedBeltName('Branca');
              } else {
                  setSelectedBeltName('Branca');
              }
          }} required className="input-style" />
        </div>
      </div>
       <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Telefone</label>
          <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="input-style" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-300">Endereço</label>
          <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="input-style" />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="beltType" className="block text-sm font-medium text-slate-300">Tipo de Faixa</label>
            <input type="text" id="beltType" value={beltType} readOnly disabled className="input-style bg-slate-600" />
        </div>
        <div>
            <label htmlFor="beltName" className="block text-sm font-medium text-slate-300">Faixa</label>
            <select id="beltName" value={selectedBeltName} onChange={e => setSelectedBeltName(e.target.value)} className="input-style">
                {availableBelts.map(b => <option key={`${b.name}-${b.type}`} value={b.name}>{b.name}</option>)}
            </select>
        </div>
      </div>
      <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-300">Data de Início</label>
          <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-style" />
      </div>
      <div className="flex items-center">
          <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"/>
          <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">Aluno Ativo</label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-blue-600">
          {student ? 'Salvar Alterações' : 'Adicionar Aluno'}
        </button>
      </div>
      <style>{`.input-style { margin-top: 4px; display: block; width: 100%; background-color: #334155; border: 1px solid #475569; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; color: #FFFFFF; } .input-style:focus { outline: none; ring: 2px; ring-color: #1565C0; border-color: #1565C0; }`}</style>
    </form>
  );
};

export default StudentForm;