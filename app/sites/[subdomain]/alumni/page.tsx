// src/app/alumni/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface Alumni {
  id: string;
  player_name: string;
  xpress_team: string | null;
  grad_year: number;
  position: string | null;
  high_school: string | null;
  college: string | null;
  image_url: string | null;
  hs_logo_url: string | null;
  college_logo_url: string | null;
}

export default function AlumniPage() {
  const [, setAlumni] = useState<Alumni[]>([]);
  const [groupedAlumni, setGroupedAlumni] = useState<{
    [key: number]: Alumni[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadAlumniData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("alumni").select("*").order("grad_year", { ascending: false });

      if (error) throw error;

      setAlumni(data || []);
      groupAlumniByGradYear(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alumni data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAlumniData();
  }, [loadAlumniData]);

  const groupAlumniByGradYear = (alumniData: Alumni[]) => {
    const grouped = alumniData.reduce((acc, player) => {
      if (!acc[player.grad_year]) {
        acc[player.grad_year] = [];
      }
      acc[player.grad_year].push(player);
      return acc;
    }, {} as { [key: number]: Alumni[] });

    // Sort players within each grad year alphabetically
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => a.player_name.localeCompare(b.player_name));
    });

    setGroupedAlumni(grouped);
  };

  const getImageUrl = (url: string): string => {
    if (!url) return "/assets/teams/defaultpfp.jpg";
    if (url.startsWith("http")) return url;
    return url.startsWith("/assets/") ? url : `/assets/${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="sticky top-0 md:top-[48px] text-left z-40 bg-secondary text-white py-4 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Xpress Alumni</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading alumni data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="sticky top-0 md:top-[48px] text-left z-40 bg-secondary text-white py-4 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Xpress Alumni</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Alumni Header */}
      <div className="sticky top-0 md:top-[48px] text-left z-40 bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Xpress Alumni</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 md:py-12 px-4">
        {Object.keys(groupedAlumni).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No alumni data available.</p>
          </div>
        ) : (
          Object.entries(groupedAlumni)
            .sort(([a], [b]) => Number(b) - Number(a)) // Sort by grad year descending
            .map(([gradYear, players]) => (
              <div key={gradYear} className="mb-12 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6 border-l-4 border-secondary pl-4">
                  Grad Year: {gradYear}
                </h2>

                {/* Mobile view */}
                <div className="md:hidden">
                  {players.map((player) => (
                    <div key={player.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                      <div className="relative h-48">
                        <Image
                          src={getImageUrl(player.image_url ?? "")}
                          alt={player.player_name}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{player.player_name}</h3>
                        <p className="text-gray-600 mb-2">{player.position}</p>
                        <p className="text-sm text-gray-500 mb-2">{player.xpress_team}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="relative w-8 h-8">
                            <Image
                              src={getImageUrl(player.hs_logo_url ?? "")}
                              alt="High School Logo"
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                          <span className="text-sm">{player.high_school}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative w-8 h-8">
                            <Image
                              src={getImageUrl(player.college_logo_url ?? "")}
                              alt="College Logo"
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                          <span className="text-sm">{player.college}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full bg-white shadow-lg rounded-lg">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left">Image</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Position</th>
                        <th className="py-3 px-4 text-left">Xpress Team</th>
                        <th className="py-3 px-4 text-left">High School</th>
                        <th className="py-3 px-4 text-left">Committed School</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="relative w-32 h-32">
                              <Image
                                src={getImageUrl(player.image_url ?? "")}
                                alt={player.player_name}
                                fill
                                className="object-cover rounded-lg shadow-md"
                                sizes="128px"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 text-lg font-medium">
                            <div>
                              <div>{player.player_name}</div>
                              <div className="text-sm text-gray-500">{player.xpress_team}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">{player.position}</td>
                          <td className="py-4 px-4">{player.xpress_team}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12">
                                <Image
                                  src={getImageUrl(player.hs_logo_url ?? "")}
                                  alt="High School Logo"
                                  fill
                                  className="object-contain"
                                  sizes="48px"
                                />
                              </div>
                              <span>{player.high_school}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12">
                                <Image
                                  src={getImageUrl(player.college_logo_url ?? "")}
                                  alt="College Logo"
                                  fill
                                  className="object-contain"
                                  sizes="48px"
                                />
                              </div>
                              <span>{player.college}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
