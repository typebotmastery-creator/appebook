import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SupportTicket } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Send, LifeBuoy } from 'lucide-react';

export const Support: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoadingTickets(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar tickets:', error);
      } else {
        setTickets(data);
      }
      setLoadingTickets(false);
    };

    fetchTickets();
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedback('Você precisa estar logado para enviar um ticket.');
      return;
    }

    setLoading(true);
    setFeedback('');

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject,
        message,
        status: 'aberto'
      });

    if (error) {
      setFeedback('Ocorreu um erro ao enviar seu ticket. Tente novamente.');
    } else {
      setFeedback('Ticket enviado com sucesso! Entraremos em contato em breve.');
      setSubject('');
      setMessage('');
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return 'bg-blue-100 text-blue-800';
      case 'em_progresso':
        return 'bg-yellow-100 text-yellow-800';
      case 'fechado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Suporte</h2>
        <p className="text-gray-600 mt-1">Precisa de ajuda? Envie-nos uma mensagem.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700">Abrir Novo Ticket</h3>
        <Input
          label="Assunto"
          value={subject}
          onChange={setSubject}
          placeholder="Ex: Problema com o capítulo 3"
          required
        />
        <Textarea
          label="Mensagem"
          value={message}
          onChange={setMessage}
          placeholder="Descreva seu problema em detalhes..."
          required
          rows={5}
        />
        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar Ticket</>}
          </Button>
          {feedback && <p className="text-sm text-green-600">{feedback}</p>}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Seus Tickets</h3>
        {loadingTickets ? (
          <p>Carregando seus tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <LifeBuoy className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Você ainda não abriu nenhum ticket de suporte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{ticket.subject}</p>
                    <p className="text-sm text-gray-500 mt-1">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t">{ticket.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
