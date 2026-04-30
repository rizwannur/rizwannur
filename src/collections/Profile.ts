import type { GlobalConfig } from 'payload'
import { revalidateProfile } from '@/lib/revalidate'

export const Profile: GlobalConfig = {
  slug: 'profile',
  admin: {
    group: 'Site',
  },
  hooks: {
    afterChange: [() => { revalidateProfile() }],
  },
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    {
      name: 'shortName',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Rafey" — shown in browser tab and avatar' },
    },
    {
      name: 'fullName',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Rizwan Nur Rafey" — shown when name is expanded' },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'Subtitle below your name' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Profile photo. Leave empty to use the default /rafey.png.' },
    },
    // ── Hero content ──────────────────────────────────────────────────────────
    {
      name: 'headline',
      type: 'textarea',
      required: true,
      admin: { description: 'Large serif italic text at the top of the page' },
    },
    {
      name: 'intro',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'recent',
      type: 'group',
      fields: [
        {
          name: 'lead',
          type: 'text',
          defaultValue: 'Most recently I shipped',
        },
        {
          name: 'company',
          type: 'group',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
            {
              name: 'brand',
              type: 'text',
              admin: { description: 'Brand hex color, e.g. #5B3FFF' },
            },
          ],
        },
        { name: 'tail', type: 'textarea' },
      ],
    },
    {
      name: 'past',
      type: 'group',
      fields: [
        {
          name: 'lead',
          type: 'text',
          defaultValue: 'Past work includes',
        },
        {
          name: 'companies',
          type: 'array',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
            { name: 'brand', type: 'text' },
          ],
        },
        { name: 'tail', type: 'text', defaultValue: '.' },
      ],
    },
    {
      name: 'searching',
      type: 'textarea',
    },
    {
      name: 'availability',
      type: 'textarea',
      admin: { description: 'Shown in the bordered availability box' },
    },
    // ── Contact & socials ─────────────────────────────────────────────────────
    {
      name: 'bookCall',
      type: 'text',
      admin: { description: 'Cal.com booking URL' },
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'GitHub', value: 'github' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Resume', value: 'resume' },
            { label: 'Email', value: 'mail' },
          ],
        },
      ],
    },
    // ── Location ──────────────────────────────────────────────────────────────
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'Asia/Dhaka',
      admin: {
        position: 'sidebar',
        description: 'IANA timezone, e.g. "Asia/Dhaka"',
      },
    },
    {
      name: 'timezoneAbbr',
      type: 'text',
      defaultValue: 'BDT',
      admin: {
        position: 'sidebar',
        description: 'Short label shown in footer, e.g. "BDT"',
      },
    },
  ],
}
