// app/dashboard/players/components/player-detail-modal.tsx
"use client";

import { Mail, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import { PlayerWithTeam } from "./player-manager";

interface PlayerDetailModalProps {
  player: PlayerWithTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerDetailModal({
  player,
  isOpen,
  onClose,
}: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Image
                src={player.headshot_url || "/assets/teams/defaultpfp.jpg"}
                alt={`${player.first_name} ${player.last_name}`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {player.first_name} {player.last_name}
                </h2>
                <p className="text-lg text-gray-600">
                  #{player.jersey_number} • {player.position}
                </p>
                <p className="text-blue-600 font-medium">
                  {player.teams?.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Personal Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span>{player.height || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Town:</span>
                  <span>{player.town || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">School:</span>
                  <span>{player.school || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Graduation:</span>
                  <span>{player.grad_year || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GPA:</span>
                  <span>{player.gpa || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Baseball Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bats:</span>
                  <span>{player.bats || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Throws:</span>
                  <span>{player.throws || "Not provided"}</span>
                </div>
                {player.twitter_handle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Twitter:</span>
                    <span className="flex items-center">
                      <Twitter className="w-3 h-3 mr-1" />@
                      {player.twitter_handle}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(player.parent_email || player.parent_phone) && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Info
                </h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {player.parent_email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{player.parent_email}</span>
                    </div>
                  )}
                  {player.parent_phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{player.parent_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
