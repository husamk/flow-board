import { useState } from 'react';
import { useBoardsStore } from '@/store/boards';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, UserPlus, Trash2 } from 'lucide-react';

interface ShareModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ boardId, isOpen, onClose }: ShareModalProps) {
  const { boards, shareBoard, removeSharedMember } = useBoardsStore();
  const board = boards.find((b) => b.id === boardId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'owner'>('editor');
  const [loading, setLoading] = useState(false);

  if (!board) return null;

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await shareBoard(boardId, email, role);
    setLoading(false);
    setEmail('');
  };

  const handleRemove = async (memberEmail: string) => {
    setLoading(true);
    await removeSharedMember(boardId, memberEmail);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-lg shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Share Board <span className="text-gray-500">({board.name})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite Member
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Mail className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Enter member email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'editor' | 'owner')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>

            <Button onClick={handleShare} disabled={loading || !email.trim()}>
              Invite
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="font-semibold">Board Members</h4>
          <ul className="divide-y divide-gray-200">
            {board.members && board.members.length > 0 ? (
              board.members.map((member, idx) => (
                <li
                  key={`${member.email}-${idx}`}
                  className="flex justify-between items-center py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs capitalize ${
                        member.role === 'owner'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.email)}
                      disabled={loading || member.role === 'owner'}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No members yet</p>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
