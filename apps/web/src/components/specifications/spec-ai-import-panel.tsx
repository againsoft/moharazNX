"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SpecificationsNav } from "@/components/specifications/specifications-nav";
import { useAttributeProfileStore } from "@/lib/store/attribute-profile-store";

const SAMPLE =
  `Intel Core i5-13420H
16GB DDR5 RAM
512GB NVMe SSD
15.6" IPS FHD 144Hz
Wi-Fi 6E · Bluetooth 5.3
Weight: 1.78 kg`;

type ParsedRow = { group: string; field: string; value: string; confidence: number };

const MOCK_PARSE: ParsedRow[] = [
  { group: "Processor", field: "CPU Brand", value: "Intel", confidence: 98 },
  { group: "Processor", field: "CPU Model", value: "Core i5-13420H", confidence: 95 },
  { group: "Memory", field: "RAM", value: "16GB DDR5", confidence: 92 },
  { group: "Storage", field: "Storage Capacity", value: "512GB SSD", confidence: 90 },
  { group: "Display", field: "Display Size", value: '15.6"', confidence: 88 },
  { group: "Display", field: "Display Type", value: "IPS", confidence: 85 },
  { group: "Display", field: "Refresh Rate", value: "144Hz", confidence: 82 },
  { group: "Connectivity", field: "Wi-Fi", value: "Wi-Fi 6E", confidence: 80 },
  { group: "Physical", field: "Weight", value: "1.78 kg", confidence: 78 },
];

export function SpecAiImportPanel() {
  const profiles = useAttributeProfileStore((s) => s.profiles);
  const [text, setText] = useState(SAMPLE);
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runImport = () => {
    if (!text.trim()) {
      toast.error("Paste supplier specifications first");
      return;
    }
    setLoading(true);
    setParsed(null);
    setTimeout(() => {
      setParsed(MOCK_PARSE);
      setLoading(false);
      toast.success("AI detected 9 specification fields");
    }, 900);
  };

  return (
    <div className="space-y-4">
      <SpecificationsNav />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-input bg-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Paste supplier specifications</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            AI detects profile, groups, fields, and values from raw text.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <Label>Target profile</Label>
              <Select
                className="mt-1"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Specification text</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={runImport} disabled={loading}>
              <Wand2 className="mr-1.5 h-4 w-4" />
              {loading ? "Analyzing…" : "Run AI Import"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-input bg-card p-4">
          <p className="text-sm font-semibold">AI output</p>
          <p className="text-xs text-muted-foreground">Review before applying to product</p>

          {!parsed && !loading && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Results will appear here after import
            </p>
          )}

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Detecting groups and fields…
            </div>
          )}

          {parsed && (
            <div className="mt-4 space-y-3">
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                Detected profile:{" "}
                <strong>{profiles.find((p) => p.id === profileId)?.name ?? "Laptop"}</strong>
              </div>
              <div className="max-h-[360px] overflow-y-auto rounded-md border border-input">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80 text-left text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Value</th>
                      <th className="px-3 py-2 w-16">Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row, i) => (
                      <tr key={i} className="border-t border-input">
                        <td className="px-3 py-2 text-muted-foreground">{row.group}</td>
                        <td className="px-3 py-2 font-medium">{row.field}</td>
                        <td className="px-3 py-2">{row.value}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={row.confidence >= 90 ? "success" : "outline"}
                            className="text-[9px]"
                          >
                            {row.confidence}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setParsed(null)}>
                  Discard
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.success("Applied to product draft (mock)")}
                >
                  Apply to product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
