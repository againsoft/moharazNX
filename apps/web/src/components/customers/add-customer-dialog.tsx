"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  CUSTOMER_GROUP_LABELS,
  type Customer,
  type CustomerGroup,
  type QuickAddCustomerInput,
} from "@/lib/mock-data/customers";
import { useCustomerStore } from "@/lib/store/customer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customer: Customer) => void;
  initialValues?: Partial<QuickAddCustomerInput>;
};

const GROUPS = Object.keys(CUSTOMER_GROUP_LABELS) as CustomerGroup[];

export function AddCustomerDialog({ open, onOpenChange, onCreated, initialValues }: Props) {
  const addCustomer = useCustomerStore((s) => s.addCustomer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState<CustomerGroup>("retail");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [region, setRegion] = useState("Dhaka Division");

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setPhone(initialValues?.phone ?? "");
    setEmail(initialValues?.email ?? "");
    setGroup(initialValues?.group ?? "retail");
    setAddress(initialValues?.address ?? "");
    setCity(initialValues?.city ?? "Dhaka");
    setRegion(initialValues?.region ?? "Dhaka Division");
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const customer = addCustomer({
      name,
      phone,
      email,
      group,
      address,
      city,
      region,
      country: "Bangladesh",
    });

    toast.success(`${customer.name} added`);
    onCreated?.(customer);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,640px)] w-[min(96vw,480px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-input bg-background shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-input px-4 py-3">
            <Dialog.Title className="text-base font-semibold">Add customer</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="rounded-md p-1 hover:bg-accent" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <Field label="Name *">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer full name" autoFocus />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Phone *">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </Field>
              </div>
              <Field label="Customer group">
                <Select value={group} onChange={(e) => setGroup(e.target.value as CustomerGroup)}>
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {CUSTOMER_GROUP_LABELS[g]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Address">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, house no." />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="City">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Region">
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-input px-4 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Add customer
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
